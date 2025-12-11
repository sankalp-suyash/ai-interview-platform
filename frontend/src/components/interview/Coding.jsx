import React, { useState, useEffect, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, Check, Clock, AlertCircle, ArrowRight, Zap, Code, User, Save, Maximize2, Minimize2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

const Coding = () => {
  const navigate = useNavigate();

  // State for interview flow
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // State for editor and submission
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  // State for loading and timing
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'running', 'submitting', 'evaluating'
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  // Refs
  const codeWorkerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // --- Interview Logic ---

  const startInterview = async () => {
    setStatus('loading');
    try {
      // 1. GENERATE QUESTION FROM AI
      const generateResponse = await axiosInstance.post(API_PATHS.QUESTIONS.GENERATE, {
        difficulty: 'Medium',
        topic: 'Arrays'
      });

      if (!generateResponse.data.success) {
        throw new Error('Failed to generate question');
      }

      const newQuestion = generateResponse.data.data;

      // 2. Track interview start
      const trackResponse = await axiosInstance.post(API_PATHS.INTERVIEWS.TRACK, {
        type: 'coding',
        questionId: newQuestion._id
      });

      setInterviewId(trackResponse.data.data._id);
      setCurrentQuestion(newQuestion);

      // Try to load saved code first
      const savedCode = localStorage.getItem(`code_${newQuestion._id}`);
      const initialCode = savedCode || newQuestion.starterCode ||
        `// Write your solution for: ${newQuestion?.title || 'Problem'}\n\nfunction solution() {\n  // Your code here\n\n};`;

      setCode(initialCode);
      setInterviewStarted(true);
      setTimeElapsed(0);
      setResults(null);
      setStatus('idle');

    } catch (error) {
      console.error('Error starting interview:', error);

      // Prefer backend-provided message when available
      const backendMsg = error?.response?.data?.message || error?.response?.data || error?.message;

      // 429 = rate limit / quota exceeded (e.g. Gemini quota)
      if (error.response?.status === 429) {
        alert(`Service rate limit reached: ${backendMsg || 'Please try again later or check your API quota.'}`);
        navigate('/dashboard');
      } else if (error.response?.status === 400) {
        // existing weekly limit handling
        alert('Weekly coding interview limit reached (2 per week)! Upgrade to Premium.');
        navigate('/dashboard');
      } else if (error.response?.status === 500) {
        // Server internal error — surface message and load a local fallback question so user can continue
        alert(`Server Error: ${backendMsg || 'Please try again later.'}\nA local demo question will be loaded so you can continue.`);

        const fallbackQuestion = {
          _id: 'local_demo',
          title: 'Two Sum (Demo)',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          starterCode: `// Write your solution for: Two Sum\n\nfunction solution(nums, target) {\n  // Your code here\n\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n`,
          testCases: [
            { input: "[2,7,11,15], 9", output: "[0,1]" },
            { input: "[3,2,4], 6", output: "[1,2]" },
            { input: "[3,3], 6", output: "[0,1]" }
          ],
          examples: [
            { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "2 + 7 = 9" }
          ],
          hints: ['Use a hash map to store seen values and indices.']
        };

        // Load saved code if available, otherwise use starterCode
        const savedCodeDemo = localStorage.getItem(`code_${fallbackQuestion._id}`);
        const initialDemoCode = savedCodeDemo || fallbackQuestion.starterCode ||
          `// Write your solution for: ${fallbackQuestion.title}\n\nfunction solution() {\n  // Your code here\n\n};`;

        setInterviewId(null);
        setCurrentQuestion(fallbackQuestion);
        setCode(initialDemoCode);
        setInterviewStarted(true);
        setTimeElapsed(0);
        setResults(null);
        setStatus('idle');

      } else {
        alert(`Error starting interview. ${backendMsg ? ('Details: ' + backendMsg) : 'Check backend status.'}`);
        setStatus('idle');
      }
    }
  };

  const saveCode = React.useMemo(
    () =>
      debounce((codeToSave, questionId) => {
        if (questionId) {
          localStorage.setItem(`code_${questionId}`, codeToSave);
        }
      }, 1000),
    []
  );

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (currentQuestion) {
      saveCode(newCode, currentQuestion._id);
    }
  };

  // --- Timer ---
  useEffect(() => {
    let timer;
    if (interviewStarted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    // Capture the ref value inside the effect
    const currentTimeout = autoSaveTimeoutRef.current;

    return () => {
      if (timer) clearInterval(timer);
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [interviewStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  // --- Safe Code Execution using Web Worker ---
  const executeUserCode = async () => {
    if (!currentQuestion) return null;

    try {
      // Create or reuse worker
      if (!codeWorkerRef.current) {
        codeWorkerRef.current = new Worker(new URL('./codeWorker.js', import.meta.url));
      }

      const testCases = currentQuestion.testCases || [];

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          codeWorkerRef.current.terminate();
          codeWorkerRef.current = null;
          reject(new Error('Execution timeout (5 seconds exceeded)'));
        }, 5000);

        codeWorkerRef.current.onmessage = (event) => {
          clearTimeout(timeoutId);
          resolve(event.data);
        };

        codeWorkerRef.current.onerror = (error) => {
          clearTimeout(timeoutId);
          codeWorkerRef.current.terminate();
          codeWorkerRef.current = null;
          reject(error);
        };

        codeWorkerRef.current.postMessage({
          code,
          testCases,
          funcName: 'solution'
        });
      });

    } catch (error) {
      throw error;
    }
  };

  // --- Button: Run Code ---
  // --- Button: Run Code ---
  const handleRunCode = async () => {
    if (!currentQuestion) return;

    console.log("🚀 Run Code clicked...");
    setStatus('running');
    setResults(null);

    // Small delay to allow UI to update to 'running' state
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const executionData = await executeUserCode();

      // 🚨 CRITICAL FIX: Check if the worker crashed silently
      if (executionData.error) {
        console.error("❌ Worker Error:", executionData.error);
        setResults({
          type: 'error',
          message: executionData.error // This will now show on screen!
        });
        setStatus('idle');
        return;
      }

      const { testResults, allPassed } = executionData;

      setResults({
        type: 'test',
        data: testResults,
        passed: allPassed
      });
      console.log("✅ Execution Complete");

    } catch (error) {
      console.error("❌ Runtime Error:", error);
      setResults({
        type: 'error',
        message: error.message || 'Code execution failed'
      });
    } finally {
      setStatus('idle');
    }
  };

  // --- Button: Submit Solution ---
  const handleSubmit = async () => {
    setStatus('submitting');
    try {
      // 1. Run the code
      let executionData;
      try {
        executionData = await executeUserCode();
      } catch (err) {
        alert(`Fix your code errors before submitting!\nError: ${err.message}`);
        setStatus('idle');
        return;
      }

      const { testResults, allPassed } = executionData;

      // 2. Calculate REAL Score
      const totalTests = testResults.length;
      const passedTests = testResults.filter(t => t.passed).length;
      const calculatedScore = totalTests === 0 ? 0 : Math.round((passedTests / totalTests) * 100);

      // 3. Generate detailed feedback
      const evaluation = {
        score: calculatedScore,
        feedback: {
          correctness: allPassed
            ? 'Perfect! All test cases passed.'
            : `You passed ${passedTests} out of ${totalTests} test cases.`,
          efficiency: testResults.length > 0 ? 'Consider time and space complexity.' : 'No tests to evaluate.',
          codeQuality: 'Review your code for clarity and maintainability.',
          suggestions: passedTests < totalTests ? [
            'Check edge cases',
            'Review problem constraints',
            'Test with custom inputs'
          ] : ['Great job! Consider optimizing for larger inputs.']
        },
        detailedAnalysis: {
          timeComplexity: 'Analyze your algorithm\'s Big O',
          spaceComplexity: 'Consider memory usage',
          rating: allPassed ? 5 : Math.max(1, Math.floor(passedTests / totalTests * 5)),
          passedTests,
          totalTests
        }
      };

      // Show the Evaluation Panel
      setResults({ type: 'evaluation', data: evaluation });

      // 4. Save to Backend
      if (interviewId) {
        await axiosInstance.put(API_PATHS.INTERVIEWS.COMPLETE.replace(':id', interviewId), {
          score: evaluation.score,
          feedback: evaluation,
          duration: timeElapsed,
          codeSubmitted: code
        });
      }

      // 5. Clear saved code
      if (currentQuestion) {
        localStorage.removeItem(`code_${currentQuestion._id}`);
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please check network and try again.');
    } finally {
      setStatus('idle');
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (interviewStarted && status === 'idle') {
          handleRunCode();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCode(code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interviewStarted, status, code, handleRunCode]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (codeWorkerRef.current) {
        codeWorkerRef.current.terminate();
      }
    };
  }, []);

  // --- Conditional Renders ---

  // Start Screen
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              AI Coding Interview
            </h1>
            <p className="text-gray-300 text-lg">
              Click start to generate a unique coding problem using Gemini AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">45 Minutes</h3>
              <p className="text-gray-400 text-sm">Typical duration</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Live AI</h3>
              <p className="text-gray-400 text-sm">Generative Questions</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <User className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Feedback</h3>
              <p className="text-gray-400 text-sm">Instant Analysis</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-amber-400 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Important
            </h3>
            <p className="text-amber-200 text-sm">
              This will use 1 of your 2 weekly coding interviews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-4 border border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={startInterview}
              disabled={status === 'loading'}
              className="flex-1 px-6 py-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {status === 'loading' ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview Screen
  return (
    <div className={`h - screen flex flex-col bg-gray-900 text-white ${isEditorFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Coding Interview</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-semibold ${currentQuestion?.difficulty === 'Easy' ? 'bg-green-500' :
              currentQuestion?.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
              {currentQuestion?.difficulty}
            </div>
            <button
              onClick={() => saveCode(code)}
              className="flex items-center text-sm text-gray-400 hover:text-white"
              title="Save code (Ctrl+S)"
            >
              <Save className="w-4 h-4 mr-1" />
              Saved
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white"
              title={isEditorFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isEditorFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRunCode}
              disabled={status !== 'idle'}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${status === 'running' ? 'bg-amber-600 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              title="Run Code (Ctrl+Enter)"
            >
              {status === 'running' ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={status !== 'idle'}
              className="flex items-center px-4 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {status === 'submitting' ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Submit Solution
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className={`${isEditorFullscreen ? 'hidden' : 'w-1/3'} bg-gray-800 border-r border-gray-700 overflow-auto`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">{currentQuestion?.title}</h2>
            <div className="prose prose-invert prose-amber mb-6">
              <p className="text-gray-300">{currentQuestion?.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Examples:</h3>
              {currentQuestion?.examples?.map((example, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="mb-2">
                    <strong className="text-gray-200">Input:</strong>
                    <div className="text-sm text-gray-300 mt-1 font-mono bg-gray-900 p-2 rounded">
                      {example.input}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-200">Output:</strong>
                    <div className="text-sm text-gray-300 mt-1 font-mono bg-gray-900 p-2 rounded">
                      {example.output}
                    </div>
                  </div>
                  <div>
                    <strong className="text-gray-200">Explanation:</strong>
                    <div className="text-sm text-gray-300 mt-1">{example.explanation}</div>
                  </div>
                </div>
              ))}
            </div>

            {currentQuestion?.hints && currentQuestion.hints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Hints:</h3>
                <ul className="space-y-2">
                  {currentQuestion.hints.map((hint, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                      <span className="text-amber-400 mr-2">•</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className={`flex - 1 flex flex-col ${isEditorFullscreen ? 'w-full' : ''}`}>
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={[javascript()]}
            onChange={handleCodeChange}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              indentOnInput: true,
              syntaxHighlighting: true,
            }}
          />
        </div>

        {/* Results Panel */}
        {
          results && (
            <div className={`${isEditorFullscreen ? 'hidden' : 'w-1/3'} bg-gray-800 border-l border-gray-700 overflow-auto`}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {results.type === 'test' ? 'Test Results' :
                    results.type === 'error' ? 'Execution Error' : 'AI Evaluation'}
                </h3>

                {results.type === 'test' && (
                  <div className="space-y-3">
                    {results.data.map((test, index) => (
                      <div key={index} className={`p-3 rounded-lg ${test.passed ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">Test Case {test.testCase}</span>
                          {test.passed ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div className="text-sm space-y-1 text-gray-300">
                          <div><strong>Input:</strong> <code className="bg-gray-900 px-1 rounded">{test.input}</code></div>
                          <div><strong>Expected:</strong> <code className="bg-gray-900 px-1 rounded">{test.expected}</code></div>
                          <div><strong>Output:</strong> <code className="bg-gray-900 px-1 rounded">{test.output}</code></div>
                        </div>
                      </div>
                    ))}
                    <div className={`p-3 rounded-lg ${results.passed ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
                      }`}>
                      <div className="text-center font-semibold text-white">
                        {results.passed ? '🎉 All test cases passed! Ready to submit.' : '⚠ Some test cases failed.'}
                      </div>
                    </div>
                  </div>
                )}

                {results.type === 'error' && (
                  <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                      <span className="font-semibold text-white">Execution Error</span>
                    </div>
                    <div className="text-sm text-gray-300 font-mono bg-gray-900 p-3 rounded">
                      {results.message}
                    </div>
                  </div>
                )}

                {results.type === 'evaluation' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-400 mb-2">
                        Score: {results.data.score}%
                      </div>
                      <div className="text-lg text-gray-300">AI Evaluation Complete</div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-white">Feedback</h4>
                        <div className="text-sm space-y-2 text-gray-300">
                          <div><strong>Correctness:</strong> {results.data.feedback.correctness}</div>
                          <div><strong>Efficiency:</strong> {results.data.feedback.efficiency}</div>
                          <div><strong>Code Quality:</strong> {results.data.feedback.codeQuality}</div>
                          {results.data.feedback.suggestions && (
                            <div>
                              <strong>Suggestions:</strong>
                              <ul className="mt-1 ml-4 list-disc">
                                {results.data.feedback.suggestions.map((suggestion, idx) => (
                                  <li key={idx}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-white">Technical Analysis</h4>
                        <div className="text-sm space-y-1 text-gray-300">
                          <div><strong>Time Complexity:</strong> {results.data.detailedAnalysis.timeComplexity}</div>
                          <div><strong>Space Complexity:</strong> {results.data.detailedAnalysis.spaceComplexity}</div>
                          <div><strong>Tests Passed:</strong> {results.data.detailedAnalysis.passedTests}/{results.data.detailedAnalysis.totalTests}</div>
                          <div><strong>Rating:</strong> {results.data.detailedAnalysis.rating}/5</div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center justify-center px-4 py-2 bg-amber-500 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                      >
                        Return to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div >
          )}
      </div >
    </div >
  );
};

export default Coding;
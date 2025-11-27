import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, Check, Clock, AlertCircle, ArrowRight, Zap, Code, FileText, User, Repeat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';

const Coding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for interview flow
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // State for editor and submission
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  // State for loading and timing
  const [isLoading, setIsLoading] = useState(true); // Default to true to load questions first
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // --- Data Fetching ---

  const fetchQuestions = useCallback(async () => {
    try {
      // NOTE: Your backend needs questions populated via /api/questions/populate
      const response = await axiosInstance.get(API_PATHS.QUESTIONS.CODING);
      if (response.data.success && response.data.data.length > 0) {
        setQuestions(response.data.data);
      } else {
        alert('No coding questions found in the database. Please run /api/questions/populate.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load questions. Check backend connection and populate route.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // --- Interview Logic ---

  const startInterview = async () => {
    if (questions.length === 0) {
      alert('No questions available. Please wait or check database population.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Pick a random question that now has a MongoDB ObjectId
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      // 2. Track interview start
      const trackResponse = await axiosInstance.post(API_PATHS.INTERVIEWS.TRACK, {
        type: 'coding',
        questionId: randomQuestion._id // <<-- FIX: Sending the correct MongoDB ObjectId
      });

      setInterviewId(trackResponse.data.data._id);
      setCurrentQuestion(randomQuestion);
      setCode(randomQuestion.starterCode || function solution() { /* Write your code here */ });
      setInterviewStarted(true);
      setTimeElapsed(0); // Reset time when starting
      setResults(null);

    } catch (error) {
      console.error('Error starting interview:', error);
      if (error.response?.status === 400) {
        alert('Weekly coding interview limit reached (2 per week)! Upgrade to Premium.');
        navigate('/dashboard');
      } else {
        alert('Error starting interview. Check backend status.');
      }
    } finally {
      setIsLoading(false);
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
    return () => clearInterval(timer);
  }, [interviewStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Code Execution (Mock) ---

  const handleRunCode = () => {
    if (!currentQuestion) return;

    try {
      // This is a basic mock execution using Function()
      const funcName = currentQuestion.starterCode.match(/function\s+(\w+)\s*\(/)?.[1] || 'solution';

      const userFunction = new Function(
        // Extract arguments from starter code signature (e.g., 'nums', 'target')
        // Using a generalized approach since questions are now dynamic
        'return function ' + currentQuestion.starterCode.substring(currentQuestion.starterCode.indexOf('(') + 1, currentQuestion.starterCode.indexOf(')')) + ' { ' + code + ' return ' + funcName + '(' + currentQuestion.starterCode.substring(currentQuestion.starterCode.indexOf('(') + 1, currentQuestion.starterCode.indexOf(')')) + '); }'
      )();

      // Mock test cases for two sum / reverse string based on title
      const testCases = currentQuestion.title === 'Two Sum' ? [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      ] : currentQuestion.title === 'Reverse String' ? [
        { args: ['hello'], expected: 'olleh' },
      ] : [];

      const testResults = testCases.map((testCase, index) => {
        try {
          const result = userFunction(...testCase.args);
          const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
          return {
            testCase: index + 1,
            input: JSON.stringify(testCase.args),
            expected: JSON.stringify(testCase.expected),
            output: JSON.stringify(result),
            passed
          };
        } catch (error) {
          return {
            testCase: index + 1,
            input: JSON.stringify(testCase.args),
            expected: JSON.stringify(testCase.expected),
            output: 'Runtime Error: ' + error.message,
            passed: false
          };
        }
      });

      setResults({
        type: 'test',
        data: testResults,
        passed: testResults.every(test => test.passed)
      });
    } catch (error) {
      setResults({
        type: 'error',
        message: 'Code compilation failed: ' + error.message
      });
    }
  };


  // --- Submission (Mock AI Evaluation) ---

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Run final tests (optional)
      handleRunCode(); // Run tests before submitting

      // 2. Simulate AI evaluation (backend will handle this in future phase)
      const evaluation = {
        score: Math.floor(Math.random() * 30) + 70,
        feedback: {
          correctness: results?.passed ? 'Solution is logically correct.' : 'Failed some test cases.',
          efficiency: 'O(n) Time Complexity - Excellent',
          codeQuality: 'Clean and readable code',
          improvements: ['Consider edge cases like empty input array.']
        },
        detailedAnalysis: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          approach: 'Hash Map',
          rating: results?.passed ? 4.5 : 3.0
        }
      };

      setResults({ type: 'evaluation', data: evaluation });

      // 3. Mark interview as completed (real API call)
      if (interviewId) {
        await axiosInstance.put(API_PATHS.INTERVIEWS.COMPLETE.replace(':id', interviewId), {
          score: evaluation.score,
          feedback: evaluation,
          duration: timeElapsed
        });
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please check network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Conditional Renders ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading questions...</div>
      </div>
    );
  }

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
              Start Coding Interview
            </h1>
            <p className="text-gray-300 text-lg">
              Practice your coding skills with real interview questions and get AI-powered feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">45 Minutes</h3>
              <p className="text-gray-400 text-sm">Typical interview duration</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <FileText className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">{questions.length} Questions Ready</h3>
              <p className="text-gray-400 text-sm">One randomly selected</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <User className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">AI Evaluation</h3>
              <p className="text-gray-400 text-sm">Instant detailed feedback</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-amber-400 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Important
            </h3>
            <p className="text-amber-200 text-sm">
              This will use 1 of your 2 weekly coding interviews. Make sure you're ready to start!
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
              disabled={isLoading || questions.length === 0}
              className="flex-1 px-6 py-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-spin" />
                  Starting Interview...
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
    <div className="h-screen flex flex-col bg-gray-900 text-white">
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
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunCode}
              className="flex items-center px-4 py-2 bg-amber-500 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
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
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-auto">
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
                    <div className="text-sm text-gray-300 mt-1 font-mono">{example.input}</div>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-200">Output:</strong>
                    <div className="text-sm text-gray-300 mt-1 font-mono">{example.output}</div>
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
        <div className="flex-1 flex flex-col">
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={[javascript()]}
            onChange={(value) => setCode(value)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
            }}
          />
        </div>

        {/* Results Panel */}
        {results && (
          <div className="w-1/3 bg-gray-800 border-l border-gray-700 overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">
                {results.type === 'test' ? 'Test Results' : 'AI Evaluation'}
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
                        <div><strong>Input:</strong> {test.input}</div>
                        <div><strong>Expected:</strong> {test.expected}</div>
                        <div><strong>Output:</strong> {test.output}</div>
                      </div>
                    </div>
                  ))}
                  <div className={`p-3 rounded-lg ${results.passed ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
                    }`}>
                    <div className="text-center font-semibold text-white">
                      {results.passed ? 'All test cases passed! Ready to submit.' : 'Some test cases failed.'}
                    </div>
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
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-white">Technical Analysis</h4>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div><strong>Time Complexity:</strong> {results.data.detailedAnalysis.timeComplexity}</div>
                        <div><strong>Space Complexity:</strong> {results.data.detailedAnalysis.spaceComplexity}</div>
                        <div><strong>Approach:</strong> {results.data.detailedAnalysis.approach}</div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Coding;
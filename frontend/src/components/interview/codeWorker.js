/* eslint-disable no-new-func */
/* global globalThis */
globalThis.addEventListener("message", (event) => {
  const { code, testCases } = event.data; // Removed funcName destructuring

  try {
    // 1. DYNAMIC FUNCTION FINDER
    // Use regex to find the function name the user actually defined
    // Matches "function myName" or "const myName ="
    const funcMatch = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/) || 
                      code.match(/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(\(|async|function)/);
    
    const detectedFuncName = funcMatch ? funcMatch[1] : 'solution';

    // 2. Create the user function wrapper
    const wrapper = new Function(`
      ${code}
      if (typeof ${detectedFuncName} === 'function') {
        return ${detectedFuncName};
      } else {
        throw new Error("Could not find function '${detectedFuncName}' in code.");
      }
    `);

    const userFunction = wrapper();

    // 3. Run Test Cases
    const results = testCases.map((testCase, index) => {
      try {
        let parsedArgs;
        let cleanInput = testCase.input;

        // Remove variable names like "nums ="
        cleanInput = cleanInput.replace(/(\w+)\s*[=:]\s*/g, "");

        try {
          if (cleanInput.trim().startsWith("[")) {
            parsedArgs = JSON.parse(`[${cleanInput}]`);
          } else {
            parsedArgs = JSON.parse(`[${cleanInput}]`);
          }
        } catch (e) {
          // Fallback parsing
          parsedArgs = cleanInput.split(",").map((arg) => {
            const trimmed = arg.trim();
            return isNaN(trimmed) ? trimmed.replace(/['"]/g, "") : Number(trimmed);
          });
        }

        const result = userFunction(...parsedArgs);

        const resultJson = JSON.stringify(result);
        const expectedJson = JSON.stringify(testCase.output);

        const passed =
          resultJson === expectedJson ||
          String(result) === String(testCase.output);

        return {
          testCase: index + 1,
          input: testCase.input,
          expected: typeof testCase.output === "object" ? JSON.stringify(testCase.output) : String(testCase.output),
          output: typeof result === "object" ? JSON.stringify(result) : String(result),
          passed,
        };
      } catch (err) {
        return {
          testCase: index + 1,
          input: testCase.input,
          expected: String(testCase.output),
          output: `Runtime Error: ${err.message}`,
          passed: false,
        };
      }
    });

    const allPassed = results.every((r) => r.passed);
    globalThis.postMessage({ testResults: results, allPassed });
  } catch (error) {
    globalThis.postMessage({
      error: error.message,
      testResults: [],
      allPassed: false,
    });
  }
});
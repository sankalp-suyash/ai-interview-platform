export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return ""; // Empty string means valid
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {string} - Empty string if valid, error message if invalid
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  return ""; // Empty string means valid
};

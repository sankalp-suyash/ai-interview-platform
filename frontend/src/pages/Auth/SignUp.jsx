// SignUp.jsx
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Code, Zap } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
  });

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== formData.password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const newFieldErrors = { ...fieldErrors };
      if (name === 'email') {
        newFieldErrors.email = validateEmail(value);
      } else if (name === 'password') {
        newFieldErrors.password = validatePassword(value);
      } else if (name === 'confirmPassword') {
        newFieldErrors.confirmPassword = validateConfirmPassword(value);
      }
      setFieldErrors(newFieldErrors);
    }
    if (error) setError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    
    const newFieldErrors = { ...fieldErrors };
    if (name === "email") {
      newFieldErrors.email = validateEmail(formData.email);
    } else if (name === "password") {
      newFieldErrors.password = validatePassword(formData.password);
    } else if (name === "confirmPassword") {
      newFieldErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword);
    }
    setFieldErrors(newFieldErrors);
  };

  const isFormValid = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmError = validateConfirmPassword(formData.confirmPassword);
    
    return !emailError && !passwordError && !confirmError && 
           formData.name && formData.email && formData.password && formData.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmError = validateConfirmPassword(formData.confirmPassword);

    if (emailError || passwordError || confirmError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmError
      });
      setTouched({
        email: true,
        password: true,
        confirmPassword: true
      });
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        const token = response.data.token;
        const userData = response.data.user;
        
        login(userData, token);
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError("An error occurred during registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Join <span className="text-amber-500">MINDMOCK</span>
          </h1>
          <p className="text-gray-600 text-lg">Start your interview preparation journey</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                    touched.email && fieldErrors.email
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                    touched.password && fieldErrors.password
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                    touched.confirmPassword && fieldErrors.confirmPassword
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm">2 Free Weekly</h3>
            <p className="text-xs text-gray-600">Coding interviews</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <Code className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm">2 Free Weekly</h3>
            <p className="text-xs text-gray-600">Behavioral interviews</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <User className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm">AI Powered</h3>
            <p className="text-xs text-gray-600">Instant feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
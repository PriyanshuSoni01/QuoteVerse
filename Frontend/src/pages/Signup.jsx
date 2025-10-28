import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { signupUser, resetSignupState } from "../../slices/SignupSlice.js"; 
import { toast } from "react-toastify";
import { setPendingEmail } from "../../slices/AuthSlice.js";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get signup state from Redux store
  const { loading, success, message, error } = useSelector(
    (state) => state.signup || {}
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const credentials = { username, email, password };
    dispatch(signupUser(credentials));
  };

  // Show toast and redirect on success
  useEffect(() => {
    if (success) {
      toast.success(message || "Signup successful!");
      setTimeout(() => {
        // Save email for OTP page
        dispatch(setPendingEmail(email));

        // Reset signup slice
        dispatch(resetSignupState());

        // Redirect to OTP page
        navigate("/otp-verification");
      }, 500);
    }
  }, [success, message, navigate, dispatch, email]);

  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetSignupState());
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-2 border-black"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Account
        </h1>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Link to Login */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;

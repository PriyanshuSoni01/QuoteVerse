import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useState,useEffect } from 'react';
import {  useDispatch, useSelector } from 'react-redux';
import { loginUser, resetLoginState } from '../../slices/LoginSlice.js';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, success, message} = useSelector((state) => state.login);
  function handleSubmit(e){
      e.preventDefault()
      const credentials = { email, password };
      dispatch(loginUser(credentials))
  }
  useEffect(() => {
      if (success) {
        toast.success(message || "Login successful!");
        setTimeout(() => {
          dispatch(resetLoginState());
          navigate("/feed");
        }, 500);
      }
    }, [success, message, navigate, dispatch]);
  
    // Show toast for errors
    useEffect(() => {
      if (error) {
        toast.error(error);
        dispatch(resetLoginState());
      }
    }, [error, dispatch]);


  return (
    <div className="flex h-full items-center justify-center bg-gray-800  min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md" >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h1>
        
        <form onSubmit={handleSubmit}>
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                value={email}
                onChange ={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange ={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {loading ? "Signing In...": "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
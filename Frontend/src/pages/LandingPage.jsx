import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import notesImage from "../assets/notesImage.png"; // Replace with your actual image path

export default function LandingPage() {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect authenticated users to feed
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show loading while checking auth or if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Redirecting to your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4 overflow-hidden p-10">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold" style={{
            fontFamily: 'Lobster, cursive',
            textShadow: '2px 2px 5px rgba(0,0,0,0.3)'
          }}>QuoteVerse</h2>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Previous pinkish glow retained */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-pink-500 opacity-30 rounded-full blur-3xl animate-pulse z-0"></div>

      {/* New blue glow */}
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-blue-500 opacity-20 rounded-full blur-2xl animate-ping z-0"></div>

      <motion.div
        className="text-center max-w-4xl z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-blue-400" style={{
    fontFamily: 'Lobster, cursive',
    fontSize: '3rem',
    textShadow: '2px 2px 5px rgba(0,0,0,0.3)',
    letterSpacing: '1px'
  }}>QuoteVerse</span>
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Share inspiring quotes and poems with a vibrant community. Express yourself through words that matter.
        </p>
        <motion.div
          whileHover={{ scale: 1.05, rotate: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="inline-block"
        >
          <Link
            to="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-16 z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <motion.img
          src={notesImage}
          alt="Notes Illustration"
          className="w-[450px] md:w-[550px] rounded-xl shadow-2xl"
          whileHover={{ rotateY: 10, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 100 }}
        />
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="bg-gray-800 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition"
        >
          <h2 className="text-xl font-bold mb-2 text-blue-400">Share Quotes</h2>
          <p className="text-gray-400">
            Express yourself through inspiring quotes and poetry.
          </p>
        </motion.div>
        <motion.div
          className="bg-gray-800 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition"
        >
          <h2 className="text-xl font-bold mb-2 text-blue-400">Connect & Discover</h2>
          <p className="text-gray-400">
            Find and connect with like-minded writers and readers.
          </p>
        </motion.div>
        <motion.div
          className="bg-gray-800 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition"
        >
          <h2 className="text-xl font-bold mb-2 text-blue-400">Community Feed</h2>
          <p className="text-gray-400">
            Discover amazing content from the QuoteVerse community.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

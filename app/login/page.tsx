"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Mail, Lock, LogIn } from 'lucide-react'; // Import icons

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        // Only redirect if result.ok is implicitly true (no error)
        router.push("/");
      }
    } catch (error) {
        console.error("Login Error:", error);
        setErrorMsg("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans">
      <div className="bg-gray-900 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-white border border-gray-800">
        <h2 className="text-3xl font-bold mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Login to continue your journey&apos;s
        </p>

        {/* Themed Error Message Box */}
        {errorMsg && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium bg-red-900 text-red-300 border border-red-700`}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 mt-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
              loading 
                ? 'bg-purple-800 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </>
            )}
          </button>
        </form>
        
        <p className="text-sm mt-6 text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-purple-400 cursor-pointer font-semibold hover:text-purple-300 transition-colors"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
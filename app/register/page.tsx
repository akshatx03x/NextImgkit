"use client";
import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';

import { useRouter } from "next/navigation";

const RegisterPage = () => {
  // Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null); // { type: 'success' | 'error', text: string }
  
  // Simulated Router
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match." });
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: 'error', text: "Password must be at least 6 characters long." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: "Registration successful! Redirecting to login..." });
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setMessage({ type: 'error', text: data.message || "Registration failed." });
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setMessage({ type: 'error', text: "An unexpected network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans">
      <div className="flex w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        
        {/* Registration Form Side */}
        <div className="w-full md:w-1/2 p-8 sm:p-10">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Create Account
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Start your 30-day free trial today
          </p>
          
          {/* Message Box for feedback */}
          {message && (
            <div 
              className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-green-900 text-green-300 border border-green-700' 
                  : 'bg-red-900 text-red-300 border border-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                id="fullName"
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
              />
            </div>
            
            {/* Username Input */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                id="username"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
              />
            </div>
            
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                id="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                id="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
              />
            </div>
            
            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                id="confirmPassword"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 mt-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
                loading ? 'bg-purple-800 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-purple-400 cursor-pointer font-semibold hover:text-purple-300 transition-colors"
            >
              Login
            </span>
          </p>
        </div>

        {/* Visual/Accent Side (Hidden on Mobile) */}
        <div 
          className="hidden md:block md:w-1/2 rounded-r-2xl p-8"
          style={{
            // Dark, rich gradient accent
            background: "linear-gradient(to bottom right, #3C335C, #5C4B7D)",
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            minHeight: '400px', // Ensure height on desktop
          }}
        >
          <div className='p-4'>
            <p className="text-white text-3xl font-light text-center leading-snug tracking-wide">
              Join the future of productivity now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component export
export default RegisterPage;

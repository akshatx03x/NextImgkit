"use client";
import React from 'react';
import { Image, Video, LogOut, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { signOut } from "next-auth/react";

const HomePage = () => {

  const handleEditImage = () => {
    console.log("Starting Image Editor...");
  };

  const handleEditVideo = () => {
    console.log("Redirecting to Video Editor...");
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" }); // redirects user to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 font-sans">

      {/* Header/Title Area */}
      <div className="text-center mb-10 w-full max-w-xl">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-xl text-purple-400 font-light">
          What would you like to create today?
        </p>
      </div>

      {/* Main Action Card */}
      <div className="w-full max-w-xl bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-800 space-y-6">
        
        {/* Image Editor Button */}
        <Link
          href="/imagepage"
          className="w-full h-24 flex items-center justify-between p-6 rounded-xl 
                     bg-gray-800 hover:bg-purple-900/50 
                     border border-gray-700 hover:border-purple-600 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-600 group-hover:bg-purple-500 transition-colors">
              <Video className="w-6 h-6 text-white" /> 
            </div>
            <span className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors">
              Edit Image
            </span>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Video Editor Link */}
        <Link
          href="/videopage"
          className="w-full h-24 flex items-center justify-between p-6 rounded-xl 
                     bg-gray-800 hover:bg-purple-900/50 
                     border border-gray-700 hover:border-purple-600 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-600 group-hover:bg-purple-500 transition-colors">
              <Video className="w-6 h-6 text-white" /> 
            </div>
            <span className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors">
              Edit Video
            </span>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Footer/Logout */}
      <div className="mt-8 w-full max-w-xl flex justify-end">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default HomePage;

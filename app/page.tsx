"use client";
import React from 'react';
import { Image, Video, LogOut, ChevronRight } from 'lucide-react';
import Link from "next/link";
// Note: External dependencies like 'next/navigation' have been removed 
// to ensure the component is self-contained and runnable in this environment.

const HomePage = () => {
    
    // Self-contained Router Simulation:
    // This object simulates the 'router.push' method used for navigation.
    const router = {
        push: (path:String) => {
            console.log(`Navigating to: ${path}`);
            // In a live application, this would change the browser's URL.
        },
    };
    
    const handleEditImage = () => {
        // Placeholder action for image editing
        console.log("Starting Image Editor...");
        // For a real app, you would use: router.push('/image-editor'); 
        router.push('/image-editor');
    };

    const handleEditVideo = () => {
        // Redirect to /videopage as requested
        console.log("Redirecting to Video Editor...");
        router.push('/videopage');
    };

    return (
        // Replicating the dark background
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

            {/* Main Action Card - Replicating the Register Page's Card style */}
            <div className="w-full max-w-xl bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-800 space-y-6">
                
                {/* Image Editor Button */}
                <button
                    onClick={handleEditImage}
                    className="w-full h-24 flex items-center justify-between p-6 rounded-xl 
                               bg-gray-800 hover:bg-purple-900/50 
                               border border-gray-700 hover:border-purple-600 transition-all duration-300 group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-purple-600 group-hover:bg-purple-500 transition-colors">
                            <Image className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                            Edit Image
                        </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </button>

                {/* Video Editor Button */}
                <Link
  href="/videopage"
  className="w-full h-24 flex items-center justify-between p-6 rounded-xl 
             bg-gray-800 hover:bg-purple-900/50 
             border border-gray-700 hover:border-purple-600 transition-all duration-300 group"
>
    <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-purple-600 group-hover:bg-purple-500 transition-colors">
            {/* Note: This should be an icon component, similar to the one used in the button */}
            <Image className="w-6 h-6 text-white" /> 
        </div>
        <span className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors">
            Edit Video {/* Updated text to match the link's purpose */}
        </span>
    </div>
    {/* Replicating the right arrow for visual consistency */}
    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
</Link>
            </div>
            
            {/* Footer/Logout Placeholder */}
            <div className="mt-8 w-full max-w-xl flex justify-end">
                <button className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>

        </div>
    );
};

export default HomePage;

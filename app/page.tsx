"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import VideoFeed from "./components/VideoFeed";
import { IVideo } from "@/models/Video";
import { Upload } from "lucide-react"; // Import an icon for the button

export default function Home() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<IVideo[]>([]);

  useEffect(() => {
    // Only fetch videos if the user is logged in and session status is authenticated
    if (status === 'authenticated') {
      const fetchVideos = async () => {
        try {
          const response = await fetch("/api/video");
          if (response.ok) {
            const data = await response.json();
            setVideos(data);
          }
        } catch (error) {
          console.error("Failed to fetch videos:", error);
        }
      };
      fetchVideos();
    }
  }, [status]); // Dependency on status ensures fetching only happens after auth check

  // Optional: Show a loading state while the session is being determined
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-white text-lg">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center pb-8 border-b border-gray-800 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Video AI Dashboard
          </h1>
          
          {session && (
            <Link 
              href="/upload" 
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-purple-900/50"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload New Video
            </Link>
          )}
        </div>

        {session ? (
          // VideoFeed component will need to have matching dark/purple theme applied internally
          <VideoFeed videos={videos} /> 
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-xl border-2 border-dashed border-gray-700 mt-10">
            <p className="text-xl font-semibold mb-4 text-gray-300">
              Access Your Video AI Tools
            </p>
            <p className="text-center text-gray-500 mb-6">
              Please **log in** to upload, process, and view your AI-enhanced videos.
            </p>
            <Link 
              href="/login" 
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-lg"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
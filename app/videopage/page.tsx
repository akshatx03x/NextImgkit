"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import VideoFeed from "../components/VideoFeed";
import { IVideo } from "@/models/Video";
import { Upload, Video, RotateCw, ArrowLeft } from "lucide-react";
import { useNotification } from "../components/Notification";

export default function VideoPage() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const { showNotification } = useNotification();

  const handleDeleteClick = async (id: string) => {
    try {
      const response = await fetch(`/api/video?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVideos((prev) => prev.filter((video) => video._id !== id));
        showNotification("Video deleted successfully", "success");
      } else {
        showNotification("Failed to delete video", "error");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      showNotification("Error deleting video", "error");
    }
  };

  const handleEditClick = (updatedVideo: IVideo) => {
    setVideos((prev) => prev.map((video) => video._id === updatedVideo._id ? updatedVideo : video));
  };

  useEffect(() => {
    if (status === "authenticated") {
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
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-3 text-white text-lg">
          <RotateCw className="animate-spin w-5 h-5 text-purple-400" />
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  let mainContent;

  if (status !== "authenticated") {
    mainContent = (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-xl border-2 border-dashed border-gray-700 mt-10">
        <p className="text-xl font-semibold mb-4 text-gray-300">
          Access Your Video AI Tools
        </p>
        <p className="text-center text-gray-500 mb-6">
          Please log in to upload, process, and view your AI-enhanced videos.
        </p>
        <Link
          href="/login"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-lg"
        >
          Go to Login
        </Link>
      </div>
    );
  } else if (videos.length === 0) {
    mainContent = (
      <div className="flex flex-col items-center justify-center p-20 bg-gray-900/50 rounded-xl border-2 border-dashed border-purple-600 mt-10 shadow-xl">
        <Video className="w-16 h-16 text-purple-500 mb-4" />
        <p className="text-2xl font-bold mb-2 text-white">
          Your Videos Will Appear Here
        </p>
        <p className="text-center text-gray-400 mb-8 max-w-md">
          It looks like you haven't uploaded any videos yet. Click below to get started!
        </p>
        <Link
          href="/upload"
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-purple-900/50 text-lg"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Your First Video
        </Link>
      </div>
    );
  } else {
    // @ts-expect-error: VideoFeedProps may not declare these handlers but they are passed for runtime usage
    mainContent = <VideoFeed videos={videos} onVideoDelete={handleDeleteClick} onVideoEdit={handleEditClick} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center pb-8 border-b border-gray-800 mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Edit ~Videos
            </h1>
          </div>
          <span className="text-sm font-light italic text-gray-300 left-3">
            Explore the ultimate power of NextImgKit
          </span>
          {session && (
            <Link
              href="/upload"
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-purple-900/50"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload
            </Link>
          )}
        </div>

        {mainContent}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUpload from "../components/FileUpload";
import VideoFeed from "../components/VideoFeed";
import { IVideo } from "@/models/Video";
import { useNotification } from "../components/Notification";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState<IVideo[]>([]);

  // ✅ Fetch all videos
  useEffect(() => {
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
  }, []);

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

  // ✅ Handle successful upload
  const handleUploadSuccess = (res: any) => {
    setVideoUrl(res.url);
    setUploading(false);
    showNotification("Video uploaded successfully!", "success");
  };

  // ✅ Handle metadata submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl) {
      showNotification("Please upload a video first", "warning");
      return;
    }

    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnailUrl: videoUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to save video");

      showNotification("Video metadata saved!", "success");

      // Refresh videos after upload
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

      // Reset form
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setUploadProgress(0);
    } catch (error) {
      showNotification("Failed to save video", "error");
    }
  };

  // ✅ Handle Logout properly
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Video with AI</h1>
        {session ? (
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
        )}
      </div>

      {/* Authenticated Content */}
      {session ? (
        <>
          {/* Upload Form Section */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-4">Upload Your Video</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold">Title</label>
                <input
                  type="text"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Description</label>
                <textarea
                  placeholder="Write a short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-full"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Upload Video</label>
                <FileUpload
                  onSuccess={handleUploadSuccess}
                  onProgress={setUploadProgress}
                  fileType="video"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <progress
                    className="progress progress-primary w-full mt-2"
                    value={uploadProgress}
                    max="100"
                  ></progress>
                )}
              </div>

              {videoUrl && (
                <video
                  src={videoUrl + '?tr=f-mp4'}
                  controls
                  className="w-full rounded-lg mt-4 border"
                />
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Submit Video"}
              </button>
            </form>
          </div>

          {/* Video Feed Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Videos</h2>
            <VideoFeed videos={videos} onVideoDelete={handleDeleteClick} onVideoEdit={handleEditClick} />
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          Please log in to upload or view your videos.
        </p>
      )}
    </div>
  );
}

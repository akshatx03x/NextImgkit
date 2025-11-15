 "use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ImageFeed from "../components/ImageFeed";
import { IImage } from "@/models/Image";
import { Upload, Image, RotateCw, ArrowLeft } from "lucide-react";
import { useNotification } from "../components/Notification";

export default function ImagePage() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState<IImage[]>([]);
  const { showNotification } = useNotification();

  const handleDeleteClick = async (id: string) => {
    try {
      const response = await fetch(`/api/image?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setImages((prev) => prev.filter((image) => image._id !== id));
        showNotification("Image deleted successfully", "success");
      } else {
        showNotification("Failed to delete image", "error");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      showNotification("Error deleting image", "error");
    }
  };

  const handleEditClick = (updatedImage: IImage) => {
    setImages((prev) => prev.map((image) => image._id === updatedImage._id ? updatedImage : image));
  };

  useEffect(() => {
    if (status === "authenticated") {
      const fetchImages = async () => {
        try {
          const response = await fetch("/api/image");
          if (response.ok) {
            const data = await response.json();
            setImages(data);
          }
        } catch (error) {
          console.error("Failed to fetch images:", error);
        }
      };
      fetchImages();
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
          Access Your Image AI Tools
        </p>
        <p className="text-center text-gray-500 mb-6">
          Please log in to upload, process, and view your AI-enhanced images.
        </p>
        <Link
          href="/login"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-lg"
        >
          Go to Login
        </Link>
      </div>
    );
  } else if (images.length === 0) {
    mainContent = (
      <div className="flex flex-col items-center justify-center p-20 bg-gray-900/50 rounded-xl border-2 border-dashed border-purple-600 mt-10 shadow-xl">
        <Image className="w-16 h-16 text-purple-500 mb-4"  />
        <p className="text-2xl font-bold mb-2 text-white">
          Your Images Will Appear Here
        </p>
        <p className="text-center text-gray-400 mb-8 max-w-md">
          It looks like you haven&apos;t uploaded any images yet. Click below to get started!
        </p>
        <Link
          href="/uploadimage"
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-purple-900/50 text-lg"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Your First Image
        </Link>
      </div>
    );
  } else {
    mainContent = <ImageFeed images={images} onImageDelete={handleDeleteClick} onImageEdit={handleEditClick} />;
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
              Edit ~Images&apos;
            </h1>
          </div>
          <span className="text-sm font-light italic text-gray-300 left-3">
            Explore the ultimate power of NextImgKit&#39;s AI tools
          </span>
          {session && (
            <Link
              href="/uploadimage"
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

"use client";

import { useState, useCallback } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FileUpload from "../components/FileUpload";
import { useNotification } from "../components/Notification";

export default function UploadImagePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { showNotification } = useNotification();

  // const handleUploadStart = useCallback(() => {
  //   setIsUploading(true);
  //   setImageUrl("");
  //   setUploadProgress(0);
  // }, []);

  const handleUploadSuccess = useCallback((res: { url: string; fileId: string; name: string; thumbnail?: string }) => {
    // Save the base URL without transformations
    setImageUrl(res.url);
    setIsUploading(false);
    setUploadProgress(100);
    showNotification("Image uploaded successfully!", "success");
  }, [showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isUploading) {
       showNotification("Please wait for the current upload to finish.", "warning");
       setIsSubmitting(false);
       return;
    }

    if (!imageUrl) {
      showNotification("Please upload an image first.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl: imageUrl, // Base URL without transformations
          thumbnailUrl: imageUrl,
          transformation: {
            filter: 'none',
            aspectRatio: '9:16',
            height: 1920,
            width: 1080,
            quality: 100,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save image");
      }

      showNotification("Image metadata saved successfully! Redirecting...", "success");
      setTimeout(() => router.push("/imagepage"), 1000);

    } catch (error) {
      console.error(error);
      showNotification("Failed to save image. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isUploading || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl p-8 sm:p-10 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 relative">
        <button
          onClick={() => router.push('/imagepage')}
          className="absolute top-4 text-sm flex items-center p-1 hover:font-medium bg-red-500 hover:bg-red-600 text-gray-100 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold mt-2 text-white">
          Upload and Analyze
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Provide details and upload your image file for AI processing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block mb-2 font-semibold text-gray-300">
              Image Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter a compelling title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 font-semibold text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe your image content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500 h-28 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-300">
              Upload Image File
            </label>
            <FileUpload
              onSuccess={handleUploadSuccess}
              onProgress={setUploadProgress}
              fileType="image"
            />

            {(isUploading || (uploadProgress > 0 && uploadProgress < 100)) && (
              <div className="w-full h-2 mt-3 rounded-full bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {uploadProgress === 100 && imageUrl && (
                <p className="mt-2 text-sm text-green-400 font-medium">
                    Upload Complete! Ready to submit details.
                </p>
            )}
          </div>

          {imageUrl && (
            <div className="pt-4">
                <Image
                    src={imageUrl}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="w-full rounded-xl mt-4 border border-purple-600 shadow-xl"
                />
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 mt-8 rounded-lg font-bold transition-all flex items-center justify-center text-lg ${
              disabled
                ? 'bg-purple-800 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/50'
            }`}
            disabled={disabled}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Metadata...
              </>
            ) : isUploading ? (
               <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading File...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Image for Analysis
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
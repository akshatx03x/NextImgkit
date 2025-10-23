"use client";

import { useState, useCallback } from "react";
import { Send, Video, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// --- START MOCK IMPORTS FOR SANDBOX ENVIRONMENT ---

// 1. Mock for useRouter from "next/navigation"
const mockUseRouter = () => ({
  push: (path) => {
    console.log(`[MOCK] Navigating to: ${path}`);
    // In a real Next.js app, this would change the URL.
  },
});

// 2. Mock for useNotification
// Provides a mock showNotification function.
const useNotification = () => ({
  showNotification: (msg, type) => {
    console.log(`[Notification MOCK - ${type.toUpperCase()}] ${msg}`);
  }
});

// 3. Mock for FileUpload Component
// This mock simulates the file upload process, showing progress and calling onSuccess.
const FileUpload = ({ onSuccess, onProgress, onUploadStart, fileType }) => {
  const [fileName, setFileName] = useState(null);
  
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    // Call the start handler
    if (onUploadStart) onUploadStart();

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        onProgress(progress);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        // Simulate a successful response object
        onSuccess({ 
            url: `https://mock-video-host.com/uploads/${file.name.replace(/\s/g, '_')}_${Date.now()}.mp4`,
            filename: file.name
        });
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-gray-800 border-gray-700 hover:bg-gray-700">
      <input
        type="file"
        accept={fileType === 'video' ? 'video/*' : '*/*'}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-mock"
        disabled={!!fileName}
      />
      <label htmlFor="file-upload-mock" className="flex flex-col items-center cursor-pointer text-gray-400">
        <Video className="w-8 h-8 mb-2 text-purple-400" />
        <p className="text-sm font-medium">
            {fileName ? `File Selected: ${fileName}` : `Click to select your ${fileType} file`}
        </p>
        <p className="text-xs mt-1 text-gray-500">Max file size: 50MB</p>
      </label>
    </div>
  );
};
// --- END MOCK IMPORTS FOR SANDBOX ENVIRONMENT ---


// Assuming this component is located at src/app/upload/page.tsx
export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockNotification, setMockNotification] = useState({ type: '', text: '', visible: false });


  const router = useRouter();
  const { showNotification } = useNotification(); 
  
  // Custom upload start handler to reset states and manage the FileUpload mock
  const handleUploadStart = useCallback(() => {
    setIsUploading(true);
    setVideoUrl(""); // Clear URL if a new upload starts
    setUploadProgress(0);
  }, []);

  const handleUploadSuccess = useCallback((res) => {
    setVideoUrl(res.url);
    setIsUploading(false);
    setUploadProgress(100); 
    showNotification("Video uploaded successfully!", "success");
  }, [showNotification]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isUploading) {
       showNotification("Please wait for the current upload to finish.", "warning");
       setIsSubmitting(false);
       return;
    }
    
    if (!videoUrl) {
      showNotification("Please upload a video first.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      // MOCK: Replace fetch with a simulated API call
      console.log("[API MOCK] Submitting Metadata:", { title, description, videoUrl });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

      // MOCK: Simulate success response
      showNotification("Video metadata saved successfully! Redirecting...", "success");
      setTimeout(() => router.push("/"), 1000); 
      
    } catch (error) {
      console.error(error);
      showNotification("Failed to save video. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isUploading || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 font-sans">
      
      {/* MOCK Notification Display */}
      {mockNotification.visible && (
        <div 
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-sm font-medium transition-all duration-300 transform ${
                mockNotification.type === 'success' 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : mockNotification.type === 'warning'
                    ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                    : 'bg-red-900 text-red-300 border border-red-700'
            }`}
        >
            {mockNotification.text}
        </div>
      )}

      <div className="w-full max-w-3xl p-8 sm:p-10 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <h1 className="text-3xl font-bold mb-2 text-white">
          Upload and Analyze
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Provide details and upload your video file for AI processing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block mb-2 font-semibold text-gray-300">
              Video Title
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

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block mb-2 font-semibold text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe your video content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-500 h-28 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block mb-2 font-semibold text-gray-300">
              Upload Video File
            </label>
            <FileUpload
              onSuccess={handleUploadSuccess}
              onProgress={setUploadProgress}
              onUploadStart={handleUploadStart} 
              fileType="video"
            />

            {/* Themed Progress Bar */}
            {(isUploading || (uploadProgress > 0 && uploadProgress < 100)) && (
              <div className="w-full h-2 mt-3 rounded-full bg-gray-700 overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            {uploadProgress === 100 && videoUrl && (
                <p className="mt-2 text-sm text-green-400 font-medium">
                    Upload Complete! Ready to submit details.
                </p>
            )}
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="pt-4">
                <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-xl mt-4 border border-purple-600 shadow-xl"
                    poster="https://placehold.co/600x400/3C335C/ffffff?text=Video+Preview"
                />
            </div>
          )}

          {/* Submit Button */}
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
                Submit Video for Analysis
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

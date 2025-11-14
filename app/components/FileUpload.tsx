"use client";

import { upload } from "@imagekit/next";
import { useState } from "react";

interface FileUploadProps {
  onSuccess: (res: { url: string; fileId: string; name: string; thumbnail?: string }) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return false;
      }
    } else if (fileType === "image") {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return false;
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB");
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      const authRes = await fetch("/api/auth/imagekit-auth");
      const auth = await authRes.json();

      if (auth.error) {
        throw new Error(auth.error);
      }

      console.log('Auth response:', auth);

      const res = await upload({
        file,
        fileName: file.name,
        publicKey: auth.publicKey,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        isPrivateFile: false,
        useUniqueFileName: true,
        folder: "/",
        onProgress: (progress) => {
          if (onProgress) {
            const percent = (progress.loaded / progress.total) * 100;
            onProgress(Math.round(percent));
          }
        },
      });

      // Pass the raw URL without transformations
      if (res.url && res.fileId && res.name) {
        onSuccess({
          url: res.url,
          fileId: res.fileId,
          name: res.name,
          thumbnail: res.thumbnailUrl,
        });
      } else {
        throw new Error("Upload failed: Missing required fields");
      }
    } catch (error) {
      console.error("Upload failed", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {uploading && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Uploading...</span>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;
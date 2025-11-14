"use client";

import { useState } from "react";
import { Trash2, Edit, Save, X, Download } from "lucide-react";

interface IVideo {
  _id?: string | number;
  title: string;
  description: string;
  videoUrl: string;
  controls: boolean;
  transformation?: {
    aspectRatio?: '16:9' | '9:16' | '4:3' | '1:1' | '21:9';
    width: number;
    height: number;
    quality: number;
    filter?: 'none' | 'sepia' | 'grayscale' | 'blur';
  };
}

export default function VideoComponent({
  video,
  onDelete,
  onEdit
}: {
  video: IVideo;
  onDelete?: (id: string) => void;
  onEdit?: (video: IVideo) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVideo, setEditedVideo] = useState(() => ({
    ...video,
    transformation: video.transformation || {
      aspectRatio: '9:16' as const,
      width: 1080,
      height: 1920,
      quality: 100,
      filter: 'none' as const
    }
  }));

  const showNotification = (msg: string, type: 'success' | 'error') => console.log(`[${type}] ${msg}`);

  const handleDelete = async () => {
    const isConfirmed = window.prompt("Type 'DELETE' to confirm deletion:") === 'DELETE';
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      if (video._id !== undefined) {
        onDelete?.(video._id.toString());
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      showNotification(error instanceof Error ? error.message : "Failed to delete video", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedVideo({
      ...video,
      transformation: video.transformation || {
        aspectRatio: '9:16' as const,
        width: 1080,
        height: 1920,
        quality: 100,
        filter: 'none' as const
      }
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/video?id=${editedVideo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedVideo),
      });
      if (!response.ok) throw new Error("Update failed.");
      const updatedData = await response.json();

      showNotification("Video updated successfully", "success");
      setIsEditing(false);
      onEdit?.(updatedData);
    } catch (error) {
      console.error("Error updating video:", error);
      showNotification(error instanceof Error ? error.message : "Failed to update video", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedVideo({
      ...video,
      transformation: video.transformation || {
        aspectRatio: '9:16' as const,
        width: 1080,
        height: 1920,
        quality: 100,
        filter: 'none' as const
      }
    });
  };

  const currentVideo = isEditing ? editedVideo : {
    ...video,
    transformation: video.transformation || {
      aspectRatio: '9:16' as const,
      width: 1080,
      height: 1920,
      quality: 100,
      filter: 'none' as const
    }
  };

  // Get base URL without existing transformations
  const getBaseUrl = (url: string) => {
    if (!url) return '';
    return url.split('?')[0];
  };

  // Build complete transformation URL
  const getTransformedVideoUrl = (includeAll: boolean = true) => {
    const baseUrl = getBaseUrl(currentVideo.videoUrl);
    if (!baseUrl) return '';

    const transforms = [];
    const trans = currentVideo.transformation!;

    // Aspect ratio transformation
    const aspectRatio = trans.aspectRatio || '9:16';
    const arMap: Record<string, string> = {
      '16:9': 'ar-16-9',
      '9:16': 'ar-9-16',
      '4:3': 'ar-4-3',
      '1:1': 'ar-1-1',
      '21:9': 'ar-21-9'
    };
    transforms.push(`${arMap[aspectRatio]},c-at_max`);

    // Quality transformation
    const quality = trans.quality || 100;
    if (quality !== 100 || includeAll) {
      transforms.push(`q-${quality}`);
    }

    // Filter transformation (ImageKit URL transformations)
    const filter = trans.filter || 'none';
    if (filter !== 'none') {
      const filterMap: Record<string, string> = {
        'sepia': 'e-sepia',
        'grayscale': 'e-grayscale',
        'blur': 'bl-10'
      };
      if (filterMap[filter]) {
        transforms.push(filterMap[filter]);
      }
    }

    const transformString = transforms.join(',');
    return `${baseUrl}?tr=${transformString}`;
  };

  const getAspectRatio = (ratio: string | undefined) => {
    const ratioMap: Record<string, string> = {
      '9:16': '9/16',
      '16:9': '16/9',
      '4:3': '4/3',
      '1:1': '1/1',
      '21:9': '21/9'
    };
    return ratioMap[ratio || '9:16'] || '9/16';
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aspectRatio = e.target.value;
    const dimensionsMap: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '4:3': { width: 1440, height: 1080 },
      '1:1': { width: 1080, height: 1080 },
      '21:9': { width: 2520, height: 1080 }
    };

    const dimensions = dimensionsMap[aspectRatio] || { width: 1080, height: 1920 };

    setEditedVideo({
      ...editedVideo,
      transformation: {
        ...editedVideo.transformation!,
        aspectRatio: aspectRatio as '16:9' | '9:16' | '4:3' | '1:1' | '21:9',
        ...dimensions
      }
    });
  };

  const handleDownload = () => {
    const downloadUrl = getTransformedVideoUrl(true);
    console.log('Downloading from:', downloadUrl);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${currentVideo.title.replace(/\s+/g, '_')}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!video || !video.videoUrl) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-4">
        <p className="text-red-400">Error: Invalid video data</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ${isEditing ? 'ring-2 ring-purple-500' : ''}`}>
      <figure className="relative px-4 pt-4">
        <div className="relative group w-full">
          <div
            className="rounded-xl overflow-hidden relative w-full bg-gray-900"
            style={{ aspectRatio: getAspectRatio(currentVideo.transformation!.aspectRatio) }}
          >
            <video
              key={getTransformedVideoUrl()}
              src={getTransformedVideoUrl()}
              controls={currentVideo.controls}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </figure>

      <div className="p-4">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedVideo.title}
              onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Title"
            />
            <textarea
              value={editedVideo.description}
              onChange={(e) => setEditedVideo({ ...editedVideo, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Description"
              rows={2}
            />

            <div className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">Aspect Ratio</label>
              <select
                value={editedVideo.transformation!.aspectRatio || '9:16'}
                onChange={handleAspectRatioChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="21:9">21:9 (Ultra-wide)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                value={editedVideo.transformation!.width}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation!, width: parseInt(e.target.value) || 0 } })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Width"
              />
              <input
                type="number"
                value={editedVideo.transformation!.height}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation!, height: parseInt(e.target.value) || 0 } })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Height"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">Quality: {editedVideo.transformation!.quality || 100}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={editedVideo.transformation!.quality || 100}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation!, quality: parseInt(e.target.value) } })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">Filter</label>
              <select
                value={editedVideo.transformation!.filter || 'none'}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation!, filter: e.target.value as 'none' | 'sepia' | 'grayscale' | 'blur' } })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="none">No Filter</option>
                <option value="sepia">Sepia</option>
                <option value="grayscale">Grayscale</option>
                <option value="blur">Blur</option>
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button onClick={handleCancel} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">{video.title}</h2>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {video.description}
            </p>

            <div className="flex gap-2">
              <button onClick={handleEdit} className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
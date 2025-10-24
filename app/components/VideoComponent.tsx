// VideoComponent.tsx
"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit, Save, X } from "lucide-react";

interface IVideo {
  _id?: string | number;
  title: string;
  description: string;
  videoUrl: string;
  controls: boolean;
  transformation: {
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
  const [editedVideo, setEditedVideo] = useState(video);

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
    setEditedVideo({ ...video });
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
        onEdit?.(updatedData); // Use updatedData from API
    } catch (error) {
      console.error("Error updating video:", error);
      showNotification(error instanceof Error ? error.message : "Failed to update video", "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedVideo(video);
  };

  const currentVideo = isEditing ? editedVideo : video;

  const getCSSFilter = () => {
    switch (currentVideo.transformation.filter) {
      case 'sepia': return 'sepia(1)';
      case 'grayscale': return 'grayscale(1)';
      case 'blur': return 'blur(10px)';
      default: return 'none';
    }
  };

  const getAspectRatio = (ratio: string | undefined) => {
    switch (ratio) {
      case '9:16': return '9/16';
      case '16:9': return '16/9';
      case '4:3': return '4/3';
      case '1:1': return '1/1';
      case '21:9': return '21/9';
      default: return '9/16';
    }
  };

  const getTransformedVideoUrl = (url: string, aspectRatio: string | undefined) => {
    // If the URL already has transformation parameters, return as is
    if (url.includes('?tr=')) return url;
    if (!aspectRatio || aspectRatio === '16:9') return url; // No transformation for 16:9 default
    // Apply transformation for other aspect ratios
    const transform = aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                     aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                     aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                     aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
    return transform ? `${url}?tr=${transform}` : url;
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aspectRatio = e.target.value;
    let width = 1080;
    let height = 1920;

    switch (aspectRatio) {
      case '16:9': width = 1920; height = 1080; break;
      case '9:16': width = 1080; height = 1920; break;
      case '4:3': width = 1440; height = 1080; break;
      case '1:1': width = 1080; height = 1080; break;
      case '21:9': width = 2520; height = 1080; break;
      default: width = 1080; height = 1920;
    }

    setEditedVideo({
      ...editedVideo,
      transformation: {
        ...editedVideo.transformation,
        aspectRatio: aspectRatio as '16:9' | '9:16' | '4:3' | '1:1' | '21:9',
        width,
        height
      }
    });
  };

  return (
    <div className={`card bg-base-100 shadow hover:shadow-lg transition-all duration-300 ${isEditing ? 'ring-2 ring-primary' : ''}`}>
      <figure className="relative px-4 pt-4">
        <div className="relative group w-full">
          <div
            className="rounded-xl overflow-hidden relative w-full"
            style={{ aspectRatio: getAspectRatio(currentVideo.transformation.aspectRatio) }}
          >
            <video
              src={getTransformedVideoUrl(currentVideo.videoUrl, currentVideo.transformation.aspectRatio)}
              controls={currentVideo.controls}
              className="w-full h-full object-cover"
              style={{ filter: getCSSFilter() }}
            />
          </div>
        </div>
      </figure>

      <div className="card-body p-4">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedVideo.title}
              onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
              className="input input-bordered input-sm w-full mb-2"
              placeholder="Title"
            />
            <textarea
              value={editedVideo.description}
              onChange={(e) => setEditedVideo({ ...editedVideo, description: e.target.value })}
              className="textarea textarea-bordered textarea-sm w-full mb-2"
              placeholder="Description"
              rows={2}
            />

            <div className="mb-2">
              <label className="label label-text text-sm">Aspect Ratio</label>
              <select
                value={editedVideo.transformation.aspectRatio || '9:16'}
                onChange={handleAspectRatioChange}
                className="select select-bordered select-sm w-full mb-2 text-white"
              >
                <option className="text-black" value="16:9">16:9 (Landscape)</option>
                <option className="text-black" value="9:16">9:16 (Portrait)</option>
                <option className="text-black" value="4:3">4:3 (Standard)</option>
                <option className="text-black" value="1:1">1:1 (Square)</option>
                <option className="text-black" value="21:9">21:9 (Ultra-wide)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                value={editedVideo.transformation.width}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation, width: parseInt(e.target.value) || 0 } })}
                className="input input-bordered input-sm"
                placeholder="Width"
              />
              <input
                type="number"
                value={editedVideo.transformation.height}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation, height: parseInt(e.target.value) || 0 } })}
                className="input input-bordered input-sm"
                placeholder="Height"
              />
            </div>

            <div className="mb-2">
              <label className="label label-text text-sm">Quality: {editedVideo.transformation.quality || 100}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={editedVideo.transformation.quality || 100}
                onChange={(e) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation, quality: parseInt(e.target.value) } })}
                className="range range-primary range-sm"
              />
            </div>

            <select
              value={editedVideo.transformation.filter || 'none'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditedVideo({ ...editedVideo, transformation: { ...editedVideo.transformation, filter: e.target.value as 'none' | 'sepia' | 'grayscale' | 'blur' } })}
              className="select select-bordered select-sm w-full mb-2 text-white"
            >
              <option className=" text-black" value="none">No Filter</option>
              <option className=" text-black" value="sepia">Sepia</option>
              <option className=" text-black" value="grayscale">Grayscale</option>
              <option className=" text-black" value="blur">Blur</option>
            </select>

            <span className="card-actions gap-2 justify-start flex">
              <button onClick={handleSave} className="btn btn-sm btn-success btn-outline">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={handleCancel} className="btn btn-sm btn-warning btn-outline">
                <X className="w-4 h-4" />
              </button>
            </span>
          </>
        ) : (
          <>
            <a href={`/videos/${video._id}`} className="hover:opacity-80 transition-opacity">
              <h2 className="card-title text-lg">Title- {video.title}</h2>
            </a>
            <p className="text-sm text-base-content/70 line-clamp-2">
              Description- {video.description}
            </p>

            <span className="card-actions gap-3 justify-start flex mt-2">
              <button onClick={handleEdit} className="btn btn-sm btn-primary btn-outline">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn btn-sm btn-error btn-outline text-red-700">
                {isDeleting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
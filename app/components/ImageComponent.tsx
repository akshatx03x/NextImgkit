// ImageComponent.tsx
  "use client";

import { useEffect, useState } from "react";
import { Trash2, Edit, Save, X, Download } from "lucide-react";
import Image from "next/image";

import { IImage } from "@/models/Image";

  export default function ImageComponent({
    image,
    onDelete,
    onEdit
  }: {
    image: IImage;
    onDelete?: (id: string) => void;
    onEdit?: (image: IImage) => void;
  }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedImage, setEditedImage] = useState(image);

    const showNotification = (msg: string, type: 'success' | 'error') => console.log(`[${type}] ${msg}`);

    const handleDelete = async () => {
      const isConfirmed = window.prompt("Type 'DELETE' to confirm deletion:") === 'DELETE';
      if (!isConfirmed) return;

      setIsDeleting(true);
      try {
        if (image._id !== undefined) {
          onDelete?.(image._id.toString());
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        showNotification(error instanceof Error ? error.message : "Failed to delete image", "error");
      } finally {
        setIsDeleting(false);
      }
    };

    const handleEdit = () => {
      setIsEditing(true);
      setEditedImage({ ...image });
    };

    const handleSave = async () => {
      try {
          const response = await fetch(`/api/image?id=${editedImage._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(editedImage),
          });
          if (!response.ok) throw new Error("Update failed.");
          const updatedData = await response.json();

          showNotification("Image updated successfully", "success");
          setIsEditing(false);
          onEdit?.(updatedData); // Use updatedData from API
      } catch (error) {
        console.error("Error updating image:", error);
        showNotification(error instanceof Error ? error.message : "Failed to update image", "error");
      }
    };

    const handleCancel = () => {
      setIsEditing(false);
      setEditedImage(image);
    };

    const currentImage = isEditing ? editedImage : image;

    const getCSSFilter = () => {
      switch (currentImage.transformation.filter) {
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

    const getTransformedImageUrl = (url: string, aspectRatio: string | undefined, includeAllTransforms: boolean = false) => {
      // If the URL already has transformation parameters, return as is
      if (url.includes('?tr=')) return url;

      const transforms = [];

      // Aspect ratio transformation
      if (aspectRatio && aspectRatio !== '16:9') {
        const arTransform = aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                           aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                           aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                           aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
        if (arTransform) transforms.push(arTransform);
      }

      // Include quality and filter only if includeAllTransforms is true (for download)
      if (includeAllTransforms) {
        const currentImage = isEditing ? editedImage : image;

        // Quality transformation
        if (currentImage.transformation.quality && currentImage.transformation.quality !== 100) {
          transforms.push(`q-${currentImage.transformation.quality}`);
        }

        // Filter transformation
        if (currentImage.transformation.filter && currentImage.transformation.filter !== 'none') {
          const filterTransform = currentImage.transformation.filter === 'sepia' ? 'e-sepia' :
                                 currentImage.transformation.filter === 'grayscale' ? 'e-grayscale' :
                                 currentImage.transformation.filter === 'blur' ? 'bl-10' : '';
          if (filterTransform) transforms.push(filterTransform);
        }
      }

      const transformString = transforms.join(',');
      return transformString ? `${url}?tr=${transformString}` : url;
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

      setEditedImage({
        ...editedImage,
        transformation: {
          ...editedImage.transformation,
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
              style={{ aspectRatio: getAspectRatio(currentImage.transformation.aspectRatio) }}
            >
              <Image
                src={getTransformedImageUrl(currentImage.imageUrl, currentImage.transformation.aspectRatio)}
                alt={currentImage.title}
                width={currentImage.transformation.width}
                height={currentImage.transformation.height}
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
                value={editedImage.title}
                onChange={(e) => setEditedImage({ ...editedImage, title: e.target.value })}
                className="input input-bordered input-sm w-full mb-2"
                placeholder="Title"
              />
              <textarea
                value={editedImage.description}
                onChange={(e) => setEditedImage({ ...editedImage, description: e.target.value })}
                className="textarea textarea-bordered textarea-sm w-full mb-2"
                placeholder="Description"
                rows={2}
              />

              <div className="mb-2">
                <label className="label label-text text-sm">Aspect Ratio</label>
                <select
                  value={editedImage.transformation.aspectRatio || '9:16'}
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
                  value={editedImage.transformation.width}
                  onChange={(e) => setEditedImage({ ...editedImage, transformation: { ...editedImage.transformation, width: parseInt(e.target.value) || 0 } })}
                  className="input input-bordered input-sm"
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={editedImage.transformation.height}
                  onChange={(e) => setEditedImage({ ...editedImage, transformation: { ...editedImage.transformation, height: parseInt(e.target.value) || 0 } })}
                  className="input input-bordered input-sm"
                  placeholder="Height"
                />
              </div>

              <div className="mb-2">
                <label className="label label-text text-sm">Quality: {editedImage.transformation.quality || 100}%</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={editedImage.transformation.quality || 100}
                  onChange={(e) => setEditedImage({ ...editedImage, transformation: { ...editedImage.transformation, quality: parseInt(e.target.value) } })}
                  className="range range-primary range-sm"
                />
              </div>

              <select
                value={editedImage.transformation.filter || 'none'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditedImage({ ...editedImage, transformation: { ...editedImage.transformation, filter: e.target.value as 'none' | 'sepia' | 'grayscale' | 'blur' } })}
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
              <a href={`/images/${image._id}`} className="hover:opacity-80 transition-opacity">
                <h2 className="card-title text-lg">Title- {image.title}</h2>
              </a>
              <p className="text-sm text-base-content/70 line-clamp-2">
                Description- {image.description}
              </p>

              <span className="card-actions gap-3 justify-start flex mt-2">
                <button onClick={handleEdit} className="btn btn-sm btn-primary btn-outline">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = getTransformedImageUrl(image.imageUrl, image.transformation.aspectRatio, true);
                    link.download = `${image.title}.jpg`;
                    link.click();
                  }}
                  className="btn btn-sm btn-info btn-outline"
                >
                  <Download className="w-4 h-4" />
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

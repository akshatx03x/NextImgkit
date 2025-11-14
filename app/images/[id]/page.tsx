"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Edit } from "lucide-react";
import { IImage } from "@/models/Image";
import { useSession } from "next-auth/react";

export default function ImageDetailPage() {
  const { id } = useParams();
  // const router = useRouter();
  const { data: session } = useSession();
  const [image, setImage] = useState<IImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/image?id=${id}`);
        if (!response.ok) throw new Error("Image not found");
        const data = await response.json();
        setImage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id]);

  const getTransformedImageUrl = (img: IImage, includeAllTransforms: boolean = false) => {
    const url = img.imageUrl;
    if (url.includes('?tr=')) return url;

    const transforms = [];

    // Aspect ratio transformation
    if (img.transformation.aspectRatio && img.transformation.aspectRatio !== '16:9') {
      const arTransform = img.transformation.aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                         img.transformation.aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                         img.transformation.aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                         img.transformation.aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
      if (arTransform) transforms.push(arTransform);
    }

    // Include quality and filter only if includeAllTransforms is true
    if (includeAllTransforms) {
      // Quality transformation
      if (img.transformation.quality && img.transformation.quality !== 100) {
        transforms.push(`q-${img.transformation.quality}`);
      }

      // Filter transformation
      if (img.transformation.filter && img.transformation.filter !== 'none') {
        const filterTransform = img.transformation.filter === 'sepia' ? 'e-sepia' :
                               img.transformation.filter === 'grayscale' ? 'e-grayscale' :
                               img.transformation.filter === 'blur' ? 'bl-10' : '';
        if (filterTransform) transforms.push(filterTransform);
      }
    }

    const transformString = transforms.join(',');
    return transformString ? `${url}?tr=${transformString}` : url;
  };

  const getCSSFilter = () => {
    if (!image) return 'none';
    switch (image.transformation.filter) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading image...</div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">{error || "Image not found"}</p>
          <Link href="/imagepage" className="text-purple-400 hover:text-purple-300">
            Back to Images
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <Link
          href="/imagepage"
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Images
        </Link>

        <div className="flex items-center space-x-4">
          {session && (
            <Link
              href={`/imagepage`}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          )}

          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = getTransformedImageUrl(image, true);
              link.download = `${image.title}.jpg`;
              link.click();
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Image Display */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl font-bold mb-4 text-center">{image.title}</h1>

          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <div
              className="relative w-full"
              style={{ aspectRatio: getAspectRatio(image.transformation.aspectRatio) }}
            >
              <img
                src={getTransformedImageUrl(image)}
                alt={image.title}
                className="w-full h-full object-contain"
                style={{ filter: getCSSFilter() }}
              />
            </div>
          </div>

          {image.description && (
            <p className="text-gray-300 text-center mt-6 max-w-2xl mx-auto">
              {image.description}
            </p>
          )}

          {/* Image Details */}
          <div className="mt-8 bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Image Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Aspect Ratio:</span>
                <span className="ml-2 text-white">{image.transformation.aspectRatio || '9:16'}</span>
              </div>
              <div>
                <span className="text-gray-400">Quality:</span>
                <span className="ml-2 text-white">{image.transformation.quality || 100}%</span>
              </div>
              <div>
                <span className="text-gray-400">Filter:</span>
                <span className="ml-2 text-white capitalize">{image.transformation.filter || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-400">Dimensions:</span>
                <span className="ml-2 text-white">{image.transformation.width} x {image.transformation.height}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

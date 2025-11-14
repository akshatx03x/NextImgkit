"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Edit } from "lucide-react";
import { IVideo } from "@/models/Video";
import { useSession } from "next-auth/react";

export default function VideoDetailPage() {
  const { id } = useParams();
  // const router = useRouter();
  const { data: session } = useSession();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/video?id=${id}`);
        if (!response.ok) throw new Error("Video not found");
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const getTransformedVideoUrl = (vid: IVideo, includeAllTransforms: boolean = false) => {
    const url = vid.videoUrl;
    if (url.includes('?tr=')) return url;

    const transforms = [];

    // Aspect ratio transformation
    if (vid.transformation.aspectRatio && vid.transformation.aspectRatio !== '16:9') {
      const arTransform = vid.transformation.aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                         vid.transformation.aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                         vid.transformation.aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                         vid.transformation.aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
      if (arTransform) transforms.push(arTransform);
    }

    // Include quality and filter only if includeAllTransforms is true
    if (includeAllTransforms) {
      // Quality transformation
      if (vid.transformation.quality && vid.transformation.quality !== 100) {
        transforms.push(`q-${vid.transformation.quality}`);
      }

      // Filter transformation
      if (vid.transformation.filter && vid.transformation.filter !== 'none') {
        const filterTransform = vid.transformation.filter === 'sepia' ? 'e-sepia' :
                               vid.transformation.filter === 'grayscale' ? 'e-grayscale' :
                               vid.transformation.filter === 'blur' ? 'bl-10' : '';
        if (filterTransform) transforms.push(filterTransform);
      }
    }

    const transformString = transforms.join(',');
    return transformString ? `${url}?tr=${transformString}` : url;
  };

  const getCSSFilter = () => {
    if (!video) return 'none';
    switch (video.transformation.filter) {
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
      case '21:9': return '21:9';
      default: return '9/16';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">{error || "Video not found"}</p>
          <Link href="/videopage" className="text-purple-400 hover:text-purple-300">
            Back to Videos
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
          href="/videopage"
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Videos
        </Link>

        <div className="flex items-center space-x-4">
          {session && (
            <Link
              href={`/videopage`}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          )}

          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = getTransformedVideoUrl(video, true);
              link.download = `${video.title}.mp4`;
              link.click();
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Video Display */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl font-bold mb-4 text-center">{video.title}</h1>

          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <div
              className="relative w-full"
              style={{ aspectRatio: getAspectRatio(video.transformation.aspectRatio) }}
            >
              <video
                src={getTransformedVideoUrl(video)}
                controls={video.controls}
                className="w-full h-full object-contain"
                style={{ filter: getCSSFilter() }}
              />
            </div>
          </div>

          {video.description && (
            <p className="text-gray-300 text-center mt-6 max-w-2xl mx-auto">
              {video.description}
            </p>
          )}

          {/* Video Details */}
          <div className="mt-8 bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Video Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Aspect Ratio:</span>
                <span className="ml-2 text-white">{video.transformation.aspectRatio || '9:16'}</span>
              </div>
              <div>
                <span className="text-gray-400">Quality:</span>
                <span className="ml-2 text-white">{video.transformation.quality || 100}%</span>
              </div>
              <div>
                <span className="text-gray-400">Filter:</span>
                <span className="ml-2 text-white capitalize">{video.transformation.filter || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-400">Dimensions:</span>
                <span className="ml-2 text-white">{video.transformation.width} x {video.transformation.height}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

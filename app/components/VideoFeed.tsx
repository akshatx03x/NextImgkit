import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponent";

interface VideoFeedProps {
  videos: IVideo[];
  onVideoDelete?: (videoId: string) => void;
  onVideoEdit?: (video: IVideo) => void;
}

export default function VideoFeed({ videos, onVideoDelete, onVideoEdit }: VideoFeedProps) {
  const handleVideoEdit = (updatedVideo: IVideo) => {
    onVideoEdit?.(updatedVideo);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoComponent 
          key={video._id?.toString()} 
          video={video} 
          onDelete={onVideoDelete} 
          onEdit={handleVideoEdit} 
        />
      ))}

      {videos.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No videos found</p>
        </div>
      )}
    </div>
  );
}
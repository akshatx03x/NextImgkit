import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponent";

interface VideoFeedProps {
  videos: IVideo[];
  onVideoDelete?: (videoId: string) => void;
  onVideoEdit?: (video: IVideo) => void;
}

export default function VideoFeed({ videos, onVideoDelete, onVideoEdit }: VideoFeedProps) {
  const handleVideoEdit = (updatedVideo: any) => {
    // Update the video in the local state
    onVideoEdit?.(updatedVideo as IVideo);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoComponent key={video._id?.toString()} video={video} onDelete={onVideoDelete} onEdit={handleVideoEdit as any} />
      ))}

      {videos.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-base-content/70">No videos found</p>
        </div>
      )}
    </div>
  );
}

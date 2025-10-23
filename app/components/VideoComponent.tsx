import { Video } from "@imagekit/next";
import Link from "next/link";
import { IVideo } from "@/models/Video";
import { useState } from "react";
import { Trash2, Edit } from "lucide-react";
import { useNotification } from "./Notification";
import { useRouter } from "next/navigation";

export default function VideoComponent({ video, onDelete }: { video: IVideo; onDelete?: (videoId: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotification();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/video?id=${video._id?.toString()}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete video (${response.status})`);
      }

      showNotification("Video deleted successfully", "success");
      onDelete?.(video._id?.toString());
    } catch (error) {
      console.error("Error deleting video:", error);
      showNotification(error instanceof Error ? error.message : "Failed to delete video", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow hover:shadow-lg transition-all duration-300">
      <figure className="relative px-4 pt-4">
        <Link href={`/videos/${video._id}`} className="relative group w-full">
          <div
            className="rounded-xl overflow-hidden relative w-full"
            style={{ aspectRatio: "9/16" }}
          >
            <Video
              src={video.videoUrl}
              path={video.videoUrl}
              transformation={[
                {
                  height: video.transformation.height.toString(),
                  width: video.transformation.width.toString(),
                  ...(video.transformation.quality && { quality: video.transformation.quality }),
                },
              ]}
              controls={video.controls}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </figure>

      <div className="card-body p-4">
        <Link
          href={`/videos/${video._id}`}
          className="hover:opacity-80 transition-opacity"
        >
          <h2 className="card-title text-lg">{video.title}</h2>
        </Link>

        <p className="text-sm text-base-content/70 line-clamp-2">
          {video.description}
        </p>

        <div className="card-actions justify-end mt-4">
          <button
            onClick={() => router.push('/videopage')}
            className="btn btn-sm btn-primary btn-outline"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-sm btn-error btn-outline"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

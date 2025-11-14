import { IImage } from "@/models/Image";
import ImageComponent from "./ImageComponent";

interface ImageFeedProps {
  images: IImage[];
  onImageDelete?: (imageId: string) => void;
  onImageEdit?: (image: IImage) => void;
}

export default function ImageFeed({ images, onImageDelete, onImageEdit }: ImageFeedProps) {
  const handleImageEdit = (updatedImage: IImage) => {
    onImageEdit?.(updatedImage);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => (
        <ImageComponent 
          key={image._id?.toString()} 
          image={image} 
          onDelete={onImageDelete} 
          onEdit={handleImageEdit} 
        />
      ))}

      {images.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No images found</p>
        </div>
      )}
    </div>
  );
}
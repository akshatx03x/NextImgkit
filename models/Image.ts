import mongoose, {Schema, model, models} from "mongoose";

export const IMAGE_DIMENSIONS = {
    width:1080,
    height:1920,
} as const;

export interface IImage {
  _id: string;
  title: string;
  id?: mongoose.Types.ObjectId;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: mongoose.Types.ObjectId;
  transformation:{
    filter: 'none' | 'sepia' | 'grayscale' | 'blur';
    aspectRatio: '16:9' | '9:16' | '4:3' | '1:1' | '21:9';
    height: number;
    width: number;
    quality?: number;
  }
}

const imageSchema = new Schema<IImage>(
  {
    title: {type: String, required: true},
    description: {type: String, required: true},
    imageUrl: {type: String, required: true},
    thumbnailUrl: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    transformation: {
      aspectRatio: {type: String, enum: ['16:9', '9:16', '4:3', '1:1', '21:9'], default: '9:16'},
      height: {type: Number, default: IMAGE_DIMENSIONS.height},
      width: {type: Number, default: IMAGE_DIMENSIONS.width},
      quality: {type: Number, min:1, max:100},
      filter: {type: String, enum: ['none', 'sepia', 'grayscale', 'blur'], default: 'none'},
    },
  },
  {timestamps: true}
);

const Image = models?.Image || model<IImage>("Image", imageSchema);
export default Image;

import mongoose, {Schema, model, models} from "mongoose";
import bcrypt from "bcryptjs";

export const VIDEO_DIMENSIONS = {
    width:1080,
    height:1920,
} as const;

export interface IVideo {
  _id: any;
  title: string;
  id?: mongoose.Types.ObjectId;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls: boolean;
  userId: mongoose.Types.ObjectId;
  transformation:{
    filter: any;
    aspectRatio: '16:9' | '9:16' | '4:3' | '1:1' | '21:9';
    height: number;
    width: number;
    quality?: number;
  }
}

const videoSchema = new Schema<IVideo>(
  {
    title: {type: String, required: true},
    description: {type: String, required: true},
    videoUrl: {type: String, required: true},
    thumbnailUrl: {type: String, required: true},
    controls: {type: Boolean, default: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    transformation: {
      aspectRatio: {type: String, enum: ['16:9', '9:16', '4:3', '1:1', '21:9'], default: '9:16'},
      height: {type: Number, default: VIDEO_DIMENSIONS.height},
      width: {type: Number, default: VIDEO_DIMENSIONS.width},
      quality: {type: Number, min:1, max:100},
    },
  },
  {timestamps: true}
);

const Video = models?.Video || model<IVideo>("Video", videoSchema);
export default Video;  
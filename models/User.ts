import mongoose, {Schema, model, models} from "mongoose";

export interface IUser {
  email: string;
  id?: mongoose.Types.ObjectId;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
const UserSchema = new Schema<IUser>(
  {
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    },
    {timestamps: true}
);

const User= models?.User || model<IUser>("User", UserSchema);
export default User;

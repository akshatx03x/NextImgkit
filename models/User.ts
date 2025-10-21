import mongoose, {Schema, model, models} from "mongoose";
import bcrypt from "bcryptjs";

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
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
    next();
});

const User= models?.User || model<IUser>("User", UserSchema);
export default User;
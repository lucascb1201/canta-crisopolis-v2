import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string;
  email: string;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Admin ||
  mongoose.model<IAdmin>("Admin", AdminSchema);

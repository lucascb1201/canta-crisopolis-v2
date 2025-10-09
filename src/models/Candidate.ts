import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Date;
}

const CandidateSchema = new Schema<ICandidate>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: String,
  state: String,
  zipCode: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Candidate ||
  mongoose.model<ICandidate>("Candidate", CandidateSchema);

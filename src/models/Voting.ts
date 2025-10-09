import mongoose, { Schema, Document } from "mongoose";

export interface IVotingOption {
  id: string;
  name: string;
  photoUrl?: string;
  musicUrl?: string;
  votes: number;
}

export interface IVoting extends Document {
  title: string;
  description?: string;
  options: IVotingOption[];
  isVisible: boolean;
  isClosed: boolean;
  showResults: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VotingOptionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  photoUrl: String,
  musicUrl: String,
  votes: {
    type: Number,
    default: 0,
  },
});

const VotingSchema = new Schema<IVoting>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    options: [VotingOptionSchema],
    isVisible: {
      type: Boolean,
      default: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Voting ||
  mongoose.model<IVoting>("Voting", VotingSchema);

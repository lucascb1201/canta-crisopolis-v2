import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  votingId: mongoose.Types.ObjectId;
  optionId: string;
  deviceFingerprint: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  votingId: {
    type: Schema.Types.ObjectId,
    ref: "Voting",
    required: true,
  },
  optionId: {
    type: String,
    required: true,
  },
  deviceFingerprint: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice composto para garantir que um dispositivo vote apenas uma vez por votação
VoteSchema.index({ votingId: 1, deviceFingerprint: 1 }, { unique: true });

export default mongoose.models.Vote ||
  mongoose.model<IVote>("Vote", VoteSchema);

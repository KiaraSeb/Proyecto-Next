import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IVote extends Document {
  review: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  value: 1 | -1;
}

const VoteSchema = new Schema<IVote>(
  {
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);

const Vote = models.Vote || model<IVote>("Vote", VoteSchema);
export default Vote;

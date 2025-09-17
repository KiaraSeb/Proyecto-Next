import { Schema, model, models, Types, Document } from "mongoose";

export interface IVote extends Document {
  review: Types.ObjectId;
  user: Types.ObjectId;
  value: 1 | -1;
}

const VoteSchema = new Schema<IVote>(
  {
    review: { type: Types.ObjectId, ref: "Review", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);

const Vote = models.Vote || model<IVote>("Vote", VoteSchema);
export default Vote;

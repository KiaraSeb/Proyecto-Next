import { Schema, model, models, Types } from "mongoose";

const VoteSchema = new Schema(
  {
    review: { type: Types.ObjectId, ref: "Review", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    value: { type: Number, enum: [1, -1], required: true }, // 👍 o 👎
  },
  { timestamps: true }
);

const Vote = models.Vote || model("Vote", VoteSchema);

export default Vote;

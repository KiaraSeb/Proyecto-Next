import { Schema, model, models, Types, Document } from "mongoose";

export interface IReview extends Document {
  bookId: string;
  user: Types.ObjectId;
  text: string;
  rating: number;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookId: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

const Review = models.Review || model<IReview>("Review", ReviewSchema);
export default Review;

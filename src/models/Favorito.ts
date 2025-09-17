import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFavorite extends Document {
  bookId: string;
  userId: Types.ObjectId;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    bookId: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);

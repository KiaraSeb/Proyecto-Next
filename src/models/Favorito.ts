import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  bookId: string;
  userId: mongoose.Types.ObjectId; // para TypeScript
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    bookId: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);

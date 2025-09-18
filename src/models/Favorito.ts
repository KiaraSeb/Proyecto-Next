import mongoose, { Types } from "mongoose"; // ✅ importa todo

export interface IFavorite extends mongoose.Document {
  bookId: string;
  userId: mongoose.Types.ObjectId;
}

const FavoriteSchema = new mongoose.Schema<IFavorite>({
  bookId: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

FavoriteSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);


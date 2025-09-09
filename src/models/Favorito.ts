import { Schema, model, models, Types } from "mongoose";

const FavoritoSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    bookId: { type: String, required: true },
  },
  { timestamps: true }
);

const Favorito = models.Favorito || model("Favorito", FavoritoSchema);

export default Favorito;

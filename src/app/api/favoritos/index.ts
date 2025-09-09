import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "c:/Users/Usuario/OneDrive - uap.edu.ar/Escritorio/proyecto-next/src/lib/mongodb";
import Favorite from "@/models/Favorito";
import { requireAuth } from "@/lib/middleware";
import { z } from "zod";

// ✅ Esquema de validación con Zod
const favoriteSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const parsed = favoriteSchema.parse(req.body); // valida el body
      const fav = await Favorite.create({
        userId: (user as any)._id,
        bookId: parsed.bookId,
      });
      return res.status(201).json({ fav });
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "Already in favorites" });
      }
      if (err.name === "ZodError") {
        return res.status(400).json({ message: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const favs = await Favorite.find({ userId: (user as any)._id });
      return res.status(200).json({ favorites: favs });
    } catch (err: any) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

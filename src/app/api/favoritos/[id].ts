import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Favorite from "@/models/Favorito";
import { requireAuth } from "@/lib/middleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "DELETE") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const fav = await Favorite.findOneAndDelete({
        _id: req.query.id,
        userId: (user as any)._id, // Solo puede borrar sus propios favoritos
      });

      if (!fav) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      return res.status(200).json({ message: "Favorite removed" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

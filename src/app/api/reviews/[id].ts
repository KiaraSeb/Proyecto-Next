import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import { requireAuth } from "@/lib/middleware";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;
  if (!mongoose.isValidObjectId(String(id))) return res.status(400).json({ error: "Invalid id" });

  if (req.method === "GET") {
    const review = await Review.findById(id).populate("userId", "email name");
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });
    return res.json({ review });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const user = await requireAuth(req, res);
    if (!user) return;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });
    if (review.userId.toString() !== (user as any)._id.toString()) return res.status(403).json({ error: "Forbidden" });

    const { title, content, rating } = req.body;
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    if (rating !== undefined) review.rating = rating;
    await review.save();
    return res.json({ review });
  }

  if (req.method === "DELETE") {
    const user = await requireAuth(req, res);
    if (!user) return;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });
    if (review.userId.toString() !== (user as any)._id.toString()) return res.status(403).json({ error: "Forbidden" });
    await review.remove();
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

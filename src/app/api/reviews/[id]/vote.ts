import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Vote from "@/models/Vote";
import { requireAuth } from "@/lib/middleware";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;
  if (!mongoose.isValidObjectId(String(id))) return res.status(400).json({ error: "Invalid id" });

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end();
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const { value } = req.body; // 1 or -1
  if (![1, -1].includes(Number(value))) return res.status(400).json({ error: "Invalid vote value" });

  const reviewId = id as string;
  // Upsert vote
  const existing = await Vote.findOne({ userId: (user as any)._id, reviewId });
  if (existing) {
    if (existing.value === value) {
      // remove vote
      await existing.remove();
    } else {
      existing.value = value;
      await existing.save();
    }
  } else {
    await Vote.create({ userId: (user as any)._id, reviewId, value });
  }

  // Recalculate votes (simple approach)
  const agg = await Vote.aggregate([
    { $match: { reviewId: new mongoose.Types.ObjectId(reviewId) } },
    { $group: { _id: "$reviewId", total: { $sum: "$value" } } }
  ]);
  const total = (agg[0] && agg[0].total) || 0;
  await Review.findByIdAndUpdate(reviewId, { votes: total });

  const updated = await Review.findById(reviewId);
  return res.json({ review: updated });
}

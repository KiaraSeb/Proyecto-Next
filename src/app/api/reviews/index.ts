import type { NextApiRequest, NextApiResponse } from "next";
import {connectDB} from "@/lib/mongodb";
import Review from "@/models/Review";
import { requireAuth } from "@/lib/middleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const user = await requireAuth(req, res);
    if (!user) return; // response sent in requireAuth

    const { bookId, title, content, rating } = req.body;
    if (!bookId || !title || !rating) return res.status(400).json({ message: "Missing fields" });

    const review = await Review.create({ bookId, userId: (user as any)._id, title, content, rating });
    return res.status(201).json({ review });
  }

  if (req.method === "GET") {
    // optional query: ?bookId=...
    const { bookId } = req.query;
    const filters: any = {};
    if (bookId) filters.bookId = String(bookId);
    const reviews = await Review.find(filters).populate("userId", "email name").sort({ createdAt: -1 });
    return res.json({ reviews });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

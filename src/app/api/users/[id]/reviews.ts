import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const { id } = req.query;
      const reviews = await Review.find({ userId: id }).populate("bookId");
      return res.status(200).json({ reviews });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

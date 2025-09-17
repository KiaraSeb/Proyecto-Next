import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Vote from "@/models/Vote";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";

// PATCH: Handle voting on a review
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Authenticate user
  const user = await requireAuthAppRouter(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const typedUser = user as { _id: string | mongoose.Types.ObjectId };

  const { value } = await req.json();
  if (![1, -1].includes(Number(value))) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  // Check if user already voted
  const existing = await Vote.findOne({ userId: typedUser._id, reviewId: id });

  if (existing) {
    if (existing.value === value) {
      await existing.deleteOne();
    } else {
      existing.value = value;
      await existing.save();
    }
  } else {
    await Vote.create({ userId: typedUser._id, reviewId: id, value });
  }

  // Recalculate total votes
  const agg = await Vote.aggregate([
    { $match: { reviewId: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: "$reviewId", total: { $sum: "$value" } } },
  ]);

  const total = agg[0]?.total || 0;
  await Review.findByIdAndUpdate(id, { votes: total });

  const updated = await Review.findById(id);
  return NextResponse.json(updated, { status: 200 });
}

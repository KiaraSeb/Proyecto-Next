// /app/api/reviews/[id]/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import  connectDB  from "@/lib/mongodb";
import Review from "@/models/Review";
import Vote from "@/models/Vote";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 importante
) {
  await connectDB();
  const { id } = await context.params; // 👈 destructuración asíncrona

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Verificar usuario autenticado
  const user = await requireAuthAppRouter(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { value } = await req.json();
  if (![1, -1].includes(Number(value))) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  const reviewId = id;

  // Buscar si ya existe el voto del usuario
  const existing = await Vote.findOne({ userId: user._id, reviewId });

  if (existing) {
    if (existing.value === value) {
      await existing.deleteOne();
    } else {
      existing.value = value;
      await existing.save();
    }
  } else {
    await Vote.create({ userId: user._id, reviewId, value });
  }

  // Recalcular total de votos
  const agg = await Vote.aggregate([
    { $match: { reviewId: new mongoose.Types.ObjectId(reviewId) } },
    { $group: { _id: "$reviewId", total: { $sum: "$value" } } },
  ]);

  const total = agg[0]?.total || 0;

  await Review.findByIdAndUpdate(reviewId, { votes: total });

  const updated = await Review.findById(reviewId);
  return NextResponse.json(updated, { status: 200 });
}

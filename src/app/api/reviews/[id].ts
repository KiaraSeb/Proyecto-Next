import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const review = await Review.findById(id).populate("userId", "email");
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }

  return NextResponse.json(review, { status: 200 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateReview(req, params.id);
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateReview(req, params.id);
}

async function updateReview(req: NextRequest, id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const user = await requireAuthAppRouter(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }

  if (review.userId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content, rating } = await req.json();
  if (content !== undefined) review.content = content;
  if (rating !== undefined) review.rating = rating;

  await review.save();
  return NextResponse.json(review, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const user = await requireAuthAppRouter(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }

  if (review.userId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await review.deleteOne();
  return NextResponse.json({}, { status: 204 });
}

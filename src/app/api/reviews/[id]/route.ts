import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";
import { IUser } from "@/models/Usuario";

// GET: Retrieve a specific review by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params; // 👈 usar await

  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const review = await Review.findById(id).populate("user", "email");
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: review._id,
      bookId: review.bookId,
      rating: review.rating,
      content: review.text,
      createdAt: review.createdAt,
      userId: review.user._id,
      userEmail: review.user.email,
    },
    { status: 200 }
  );
}

// PUT / PATCH: Update a specific review
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateReview(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateReview(req, context);
}

async function updateReview(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const user = (await requireAuthAppRouter(req)) as IUser | null;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }

  if (String(review.user) !== String(user._id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content, rating } = await req.json();
  if (content !== undefined) review.text = content;
  if (rating !== undefined) review.rating = rating;

  await review.save();

  return NextResponse.json(
    {
      id: review._id,
      bookId: review.bookId,
      rating: review.rating,
      content: review.text,
      createdAt: review.createdAt,
      userId: user._id,
      userEmail: user.email,
    },
    { status: 200 }
  );
}

// DELETE: Delete a specific review
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const user = (await requireAuthAppRouter(req)) as IUser | null;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
  }

  if (String(review.user) !== String(user._id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await review.deleteOne();
  return NextResponse.json({}, { status: 204 });
}

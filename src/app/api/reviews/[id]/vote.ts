import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const user = await requireAuthAppRouter(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const review = await Review.findById(id);
  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  if (review.user.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "No puedes editar reseñas de otros" }, { status: 403 });
  }

  review.text = body.text ?? review.text;
  review.rating = body.rating ?? review.rating;
  await review.save();

  return NextResponse.json(review, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;

  const user = await requireAuthAppRouter(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const review = await Review.findById(id);
  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  if (review.user.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "No puedes eliminar reseñas de otros" }, { status: 403 });
  }

  await review.deleteOne();

  return NextResponse.json({ message: "Reseña eliminada" }, { status: 200 });
}

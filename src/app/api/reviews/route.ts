import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";  // Default import
import Review from "@/models/Review";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";

// GET /api/reviews?bookId=...
export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId || !mongoose.isValidObjectId(bookId)) {
    return NextResponse.json({ error: "bookId inválido o faltante" }, { status: 400 });
  }

  // Buscar reseñas y hacer populate del usuario
  const reviews = await Review.find({ bookId }).populate("user", "email");

  // Formatear para frontend
  const formatted = reviews.map((r) => ({
    id: r._id,
    bookId: r.bookId,
    rating: r.rating,
    content: r.text,
    createdAt: r.createdAt,
    userId: r.user._id,
    userEmail: r.user.email,
  }));

  return NextResponse.json(formatted, { status: 200 });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  await connectDB();

  const user = await requireAuthAppRouter(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const typedUser = user as { _id: string | mongoose.Types.ObjectId; email?: string };

  const { bookId, rating, content } = await req.json();

  if (!bookId || !content || !mongoose.isValidObjectId(bookId)) {
    return NextResponse.json({ error: "Datos incompletos o bookId inválido" }, { status: 400 });
  }

  try {
    const newReview = await Review.create({
      bookId,
      user: typedUser._id, // coincide con schema
      rating,
      text: content,
    });

    // Formatear respuesta
    const response = {
      id: newReview._id,
      bookId: newReview.bookId,
      rating: newReview.rating,
      content: newReview.text,
      createdAt: newReview.createdAt,
      userId: typedUser._id,
      userEmail: typedUser.email,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
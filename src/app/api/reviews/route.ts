// /app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import { requireAuthAppRouter } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId requerido" }, { status: 400 });
  }

  // Buscar reseñas y hacer populate del usuario
  const reviews = await Review.find({ bookId }).populate("user", "email");

  // Formatear para que el frontend reciba userId y userEmail
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

export async function POST(req: NextRequest) {
  await connectDB();

  const user = await requireAuthAppRouter(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bookId, rating, content } = await req.json();

  if (!bookId || !content) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const newReview = await Review.create({
    bookId,
    user: user._id, // coincide con el schema
    rating,
    text: content,
  });

  // Incluir userId y userEmail en la respuesta
  const response = {
    id: newReview._id,
    bookId: newReview.bookId,
    rating: newReview.rating,
    content: newReview.text,
    createdAt: newReview.createdAt,
    userId: user._id,
    userEmail: user.email,
  };

  return NextResponse.json(response, { status: 201 });
}

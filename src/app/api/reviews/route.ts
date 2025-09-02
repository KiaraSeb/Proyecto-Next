import { NextRequest, NextResponse } from "next/server";
import type { Review } from "@/types";
import { reviews } from "./data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId requerido" }, { status: 400 });
  }
  return NextResponse.json(reviews.filter(r => r.bookId === bookId));
}

export async function POST(req: NextRequest) {
  const { bookId, userName, rating, content } = await req.json();

  if (!bookId || !userName || !content) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const newReview: Review = {
    id: Date.now().toString(),
    bookId,
    userName,
    rating,
    content,
    createdAt: new Date().toISOString(),
    votes: [],
  };

  reviews.push(newReview);
  return NextResponse.json(newReview);
}

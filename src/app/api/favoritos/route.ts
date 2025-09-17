import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Favorite from "@/models/Favorito";
import { requireAuthAppRouter } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await requireAuthAppRouter(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const favs = await Favorite.find({ userId: user._id });
  return NextResponse.json({ favorites: favs }, { status: 200 });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const user = await requireAuthAppRouter(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { bookId } = await req.json();
  if (!bookId) return NextResponse.json({ message: "Missing bookId" }, { status: 400 });

  try {
    const fav = await Favorite.create({ userId: user._id, bookId });
    return NextResponse.json({ favorite: fav }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ message: "Already in favorites" }, { status: 409 });
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

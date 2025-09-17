import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Favorite from "@/models/Favorito";
import { requireAuthAppRouter } from "@/lib/middleware";
import mongoose from "mongoose";

export async function DELETE(req: NextRequest) {
  await connectDB();
  const user = await requireAuthAppRouter(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const fav = await Favorite.findOneAndDelete({ _id: id, userId: user._id });
  if (!fav) return NextResponse.json({ message: "Favorite not found" }, { status: 404 });

  return NextResponse.json({ message: "Favorite removed" }, { status: 200 });
}

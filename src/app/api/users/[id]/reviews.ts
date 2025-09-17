import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuthAppRouter } from "@/lib/middleware";
import Review from "@/models/Review";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const { id } = params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // Verificar sesión (opcional: si querés que solo el mismo usuario pueda ver sus reseñas)
  const user = await requireAuthAppRouter(req);
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Si querés restringir que SOLO el dueño pueda ver sus reseñas:
  if (user._id.toString() !== id.toString()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const reviews = await Review.find({ user: id }).sort({ createdAt: -1 });

  return NextResponse.json({ reviews }, { status: 200 });
}

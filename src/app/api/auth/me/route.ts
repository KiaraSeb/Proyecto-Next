import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/Usuario";
import  connectDB  from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null, message: "No autenticado" }, { status: 200 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await User.findById(decoded.id).select("_id email name");
    if (!user) {
      return NextResponse.json({ user: null, message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { user: null, message: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}

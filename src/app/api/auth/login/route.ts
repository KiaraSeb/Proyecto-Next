import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/Usuario";

export async function POST(req: Request) {
  try {
    await connectMongo();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { _id: user._id, name: user.name, email: user.email },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error en login:", err);
    return NextResponse.json(
      { message: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}

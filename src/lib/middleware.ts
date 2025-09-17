// lib/middleware-app.ts
import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import User from "@/models/Usuario";

export async function requireAuthAppRouter(req: NextRequest) {
  const token = req.cookies.get(process.env.COOKIE_NAME || "libros_session")?.value;
  if (!token) return null;

  try {
    const payload: any = verifyToken(token);
    const user = await User.findById(payload.userId);
    return user || null;
  } catch {
    return null;
  }
}

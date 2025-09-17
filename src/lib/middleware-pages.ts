// lib/middleware-pages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { verifyToken } from "./auth";
import User from "@/models/Usuario";

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[process.env.COOKIE_NAME || "libros_session"];
  if (!token) {
    res.status(401).json({ error: "No autorizado" });
    return null;
  }

  try {
    const payload: any = verifyToken(token);
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Token inválido" });
    return null;
  }
}

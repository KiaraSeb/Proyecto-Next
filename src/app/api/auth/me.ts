import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import cookie from "cookie";
import User from "@/models/Usuario";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[process.env.COOKIE_NAME || "sesion_app_libros"];
  if (!token) return res.json({ user: null });

  try {
    const payload: any = verifyToken(token);
    const user = await User.findById(payload.sub).select("-password");
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
}

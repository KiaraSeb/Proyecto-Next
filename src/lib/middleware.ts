import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { verifyToken } from "./auth";
import connectDB from "./mongodb";
import User from "../models/Usuario";

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[process.env.COOKIE_NAME || "sesion_app_libros"];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  try {
    const payload: any = verifyToken(token);
    const user = await User.findById(payload.sub).select("-password");
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return null;
    }
    // attach user to request
    (req as any).user = user;
    return user;
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
}

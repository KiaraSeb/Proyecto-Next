import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import User, { IUser } from "@/models/Usuario";

export async function requireAuthAppRouter(req: NextRequest): Promise<IUser | null> {
  const token = req.cookies.get(process.env.COOKIE_NAME || "libros_session")?.value;
  if (!token) return null;

  try {
    const payload: any = verifyToken(token);
    const user = await User.findById<IUser>(payload.userId); 
    return user || null;
  } catch {
    return null;
  }
}

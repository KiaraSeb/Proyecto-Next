import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import User from "@/models/Usuario";
import { comparePassword, signToken, setTokenCookie } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ sub: user._id, email: user.email });
  setTokenCookie(res, token);

  res.json({ user: { id: user._id, email: user.email, name: user.name } });
}

import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import User from "@/models/Usuario";
import { hashPassword, signToken, setTokenCookie } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const hashed = await hashPassword(password);
  const user = await User.create({ email, password: hashed, name });
  const token = signToken({ sub: user._id, email: user.email });
  setTokenCookie(res, token);

  res.status(201).json({ user: { id: user._id, email: user.email, name: user.name } });
}

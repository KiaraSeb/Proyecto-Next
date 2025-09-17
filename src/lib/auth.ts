import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { NextApiResponse } from "next";

const JWT_SECRET: string = process.env.JWT_SECRET || "changemeplease";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

const COOKIE_NAME = process.env.COOKIE_NAME || "libros_session";

export async function hashPassword(plain: string) {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function setTokenCookie(res: NextApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; ${
      isProd ? "Secure;" : ""
    }`
  );
}

export function clearTokenCookie(res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;`
  );
}
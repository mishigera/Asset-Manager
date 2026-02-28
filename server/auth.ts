import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // opcional: hash bcrypt en env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // si no hay HASH, se compara en texto (solo para desarrollo; en prod usar HASH)

export interface JwtPayload {
  sub: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function createToken(username: string): string {
  if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters");
  }
  return jwt.sign(
    { sub: username, role: "admin" } as JwtPayload,
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!ADMIN_USERNAME) return false;
  if (username !== ADMIN_USERNAME) return false;
  if (ADMIN_PASSWORD_HASH) {
    return verifyPassword(password, ADMIN_PASSWORD_HASH);
  }
  if (ADMIN_PASSWORD) {
    return password === ADMIN_PASSWORD;
  }
  return false;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: "Token requerido" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    res.status(401).json({ message: "Token inválido o expirado" });
    return;
  }
  (req as any).user = payload;
  next();
}

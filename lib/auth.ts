import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "botellapp-secret-2024";

export interface TokenPayload {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  negocioId: number;
  clienteId: number;
  negocioNombre: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("botellapp-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

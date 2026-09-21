import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET no está configurado. Defínelo en las variables de entorno antes de firmar o verificar sesiones."
    );
  }
  return secret;
}

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
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "8h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
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

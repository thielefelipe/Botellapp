import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada" }, { status: 200 });
  response.cookies.set("botellapp-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

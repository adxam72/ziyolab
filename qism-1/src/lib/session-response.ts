import { NextResponse } from "next/server";
import { COOKIE } from "./auth";

export function sessionResponse(token: string, status = 200) {
  const response = NextResponse.json({ ok: true }, { status });
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });
  return response;
}

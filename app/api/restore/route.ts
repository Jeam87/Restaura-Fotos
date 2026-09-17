import { NextResponse } from "next/server";
export const runtime = "nodets";
export async function POST(req: Request) {
  return NextResponse.json({ ok: true });
}

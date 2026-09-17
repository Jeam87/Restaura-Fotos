import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  return NextResponse.json({ ok: true });
}

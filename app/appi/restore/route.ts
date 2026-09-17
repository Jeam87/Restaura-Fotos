import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ ok: true, body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

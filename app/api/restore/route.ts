import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image = body.image;
    const prompt = body.prompt || "restore old photo, remove scratches";

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId ||!apiToken) {
      return NextResponse.json({ error: "Faltan env vars" }, { status: 500 });
    }

    let base64 = image;
    if (image.includes(",")) {
      base64 = image.split(",")[1];
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

    const cfRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image: base64,
      }),
    });

    const text = await cfRes.text();

    if (!cfRes.ok) {
      return NextResponse.json({ error: text }, { status: 500 });
    }

    // Cloudflare a veces regresa imagen binaria
    try {
      const json = JSON.parse(text);
      if (json.result && typeof json.result === "string") {
        return NextResponse.json({ restored: json.result });
      }
    } catch {}

    // Si no es JSON, es imagen
    const binary = Buffer.from(text, "binary").toString("base64");
    return NextResponse.json({ restored: `data:image/jpeg;base64,${binary}` });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

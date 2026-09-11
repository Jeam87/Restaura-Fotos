export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file) return new Response(JSON.stringify({ error: "No imagen" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const prompt = form.get("prompt") || "restore old photo, flawless repair";

    const arrayBuffer = await file.arrayBuffer();
    let base64;
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else if (typeof globalThis.btoa === "function") {
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 0x8000;
      let binary = "";
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      base64 = globalThis.btoa(binary);
    } else {
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      if (typeof Buffer !== "undefined") base64 = Buffer.from(binary, "binary").toString("base64");
      else throw new Error("No se puede convertir la imagen a base64");
    }

    const account = process.env.CLOUDFLARE_ACCOUNT_ID || "c8189d023817f7559eff989ecdb0fbc8";
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ error: "Falta configurar la variable CLOUDFLARE_API_TOKEN en Vercel" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Ajustamos la IA para máxima potencia contra rayas marcadas y manchas
    const cfRes = await fetch(
      `https://cloudflare.com{account}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: prompt, 
          image: base64, 
          num_steps: 30, // Más pasos para mejorar la definición de rostros y detalles
          strength: 0.85 // Fuerza alta para obligar a la IA a sobreescribir las grietas profundas
        }),
      }
    );

    if (!cfRes.ok) {
      const txt = await cfRes.text();
      let parsed;
      try { parsed = JSON.parse(txt); } catch (_) { parsed = txt; }
      return new Response(JSON.stringify({ error: parsed }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const contentType = cfRes.headers.get("content-type") || "image/png";
    const outBuffer = await cfRes.arrayBuffer();
    return new Response(outBuffer, { status: 200, headers: { "Content-Type": contentType } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
 

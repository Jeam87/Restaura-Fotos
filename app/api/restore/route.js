export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file) return new Response(JSON.stringify({ error: "No imagen" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const prompt = form.get("prompt") || "restore old photo, fill missing torn parts, remove cracks, photorealistic";

    // Convierte el archivo a base64 de forma robusta (funciona en Node y en runtimes Edge)
    const arrayBuffer = await file.arrayBuffer();
    let base64;
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else if (typeof globalThis.btoa === "function") {
      // btoa sobre una cadena binaria; procesamos en chunks para evitar problemas de tamaño
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 0x8000;
      let binary = "";
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      base64 = globalThis.btoa(binary);
    } else {
      // Fallback: construir string y usar Buffer si está disponible
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      if (typeof Buffer !== "undefined") base64 = Buffer.from(binary, "binary").toString("base64");
      else throw new Error("No se puede convertir la imagen a base64 en este entorno");
    }

    const account = process.env.CLOUDFLARE_ACCOUNT_ID || "c8189d023817f7559eff989ecdb0fbc8";
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ error: "CLOUDFLARE_API_TOKEN no establecido" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt, image: base64, num_steps: 20, strength: 0.8 }),
      }
    );

    if (!cfRes.ok) {
      const txt = await cfRes.text();
      let parsed;
      try {
        parsed = JSON.parse(txt);
      } catch (_) {
        parsed = txt;
      }
      return new Response(JSON.stringify({ error: parsed }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Devuelve directamente el cuerpo binario con el Content-Type que venga de Cloudflare
    const contentType = cfRes.headers.get("content-type") || "image/png";
    const outBuffer = await cfRes.arrayBuffer();
    return new Response(outBuffer, { status: 200, headers: { "Content-Type": contentType } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

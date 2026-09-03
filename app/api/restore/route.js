export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file) return new Response(JSON.stringify({error:"No imagen"}), {status:400});

    const prompt = form.get("prompt") || "restore old photo, fill missing torn parts, remove cracks, photorealistic";
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const account = process.env.CLOUDFLARE_ACCOUNT_ID || "c8189d023817f7559eff989ecdb0fbc8";
    const token = process.env.CLOUDFLARE_API_TOKEN;

    const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        image: base64,
        num_steps: 20,
        strength: 0.8
      })
    });

    if (!cfRes.ok) {
      const txt = await cfRes.text();
      return new Response(JSON.stringify({error: txt}), {status: 500, headers:{"Content-Type":"application/json"}});
    }

    // Cloudflare devuelve la imagen directo
    const imgBlob = await cfRes.blob();
    return new Response(imgBlob, {headers:{"Content-Type":"image/png"}});

  } catch(e) {
    return new Response(JSON.stringify({error:e.message}), {status:500});
  }
}

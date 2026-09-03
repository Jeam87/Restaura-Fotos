export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file) return new Response(JSON.stringify({error:"No imagen"}), {status:400});
    
    const prompt = form.get("prompt") || "restore old photo, fill missing torn white part, remove cracks and scratches, photorealistic, high detail, keep faces intact";
    const buf = await file.arrayBuffer();
    const base64 = Buffer.from(buf).toString('base64');

    const account = "c8189d023817f7559eff989ecdb0fbc8";
    const token = process.env.CLOUDFLARE_API_TOKEN;

    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type":"application/json" },
      body: JSON.stringify({ prompt, image: base64, num_steps: 20 })
    });

    if(!r.ok){
      const t = await r.text();
      return new Response(JSON.stringify({error:t}), {status:500, headers:{"Content-Type":"application/json"}});
    }
    const blob = await r.blob();
    return new Response(blob, {headers:{"Content-Type":"image/png"}});
  } catch(e){
    return new Response(JSON.stringify({error:e.message}), {status:500});
  }
}

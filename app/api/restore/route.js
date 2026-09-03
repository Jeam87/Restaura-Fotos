export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file) return new Response(JSON.stringify({error:"No imagen"}), {status:400});

    const prompt = form.get("prompt") || "restore old photo, fill missing torn white part, remove cracks and scratches, photorealistic, high detail, keep faces intact, sharp";
    const bytes = await file.arrayBuffer();

    const account = "c8189d023817f7559eff989ecdb0fbc8";
    const token = process.env.CLOUDFLARE_API_TOKEN;

    // Cloudflare quiere multipart, no json
    const cfForm = new FormData();
    cfForm.append("prompt", prompt);
    cfForm.append("image", new Blob([bytes], {type: "image/png"}), "photo.png");
    // opcional para inpainting, si no pones mask rellena todo lo roto
    cfForm.append("num_steps", "20");

    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: cfForm
    });

    const text = await r.text();
    // Si devuelve imagen, es binario, si devuelve error es texto json
    if(!r.ok){
      return new Response(JSON.stringify({error:text}), {status:500, headers:{"Content-Type":"application/json"}});
    }

    // Cloudflare devuelve imagen directa
    try {
      const json = JSON.parse(text);
      if(json.result?.image){
        const imgBuffer = Buffer.from(json.result.image, 'base64');
        return new Response(imgBuffer, {headers:{"Content-Type":"image/png"}});
      }
    } catch(e) {
      // Si no es JSON, es la imagen ya
      return new Response(Buffer.from(text, 'binary'), {headers:{"Content-Type":"image/png"}});
    }

    return new Response(text, {headers:{"Content-Type":"image/png"}});

  } catch(e){
    return new Response(JSON.stringify({error:e.message}), {status:500});
  }
}

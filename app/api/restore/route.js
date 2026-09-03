export async function POST(req){
 try{
  const {image, prompt} = await req.json();
  
  const resFetch = await fetch(image);
  const blob = await resFetch.blob();
  const form = new FormData();
  form.append('image', blob, 'photo.jpg');
  // Si quieres que rellene pedazos rotos, manda prompt
  if(prompt) form.append('text', prompt);

  // Este es el que usaste en la captura - editor generativo
  const r = await fetch("https://api.deepai.org/api/image-editor",{
   method:"POST",
   headers:{'Api-Key': process.env.DEEPAI_KEY},
   body: form
  });

  const j = await r.json();
  if(j.output_url){
    return Response.json({status:"succeeded", output:j.output_url});
  } else {
    // fallback a super-resolution si falla
    const r2 = await fetch("https://api.deepai.org/api/torch-srgan",{
      method:"POST",
      headers:{'Api-Key': process.env.DEEPAI_KEY},
      body: form
    });
    const j2 = await r2.json();
    return Response.json({status:"succeeded", output:j2.output_url});
  }
 }catch(e){ return Response.json({error:e.message},{status:500}); }
}

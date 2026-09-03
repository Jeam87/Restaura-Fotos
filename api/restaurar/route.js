export async function POST(req){
  const form = await req.formData();
  const file = form.get('image');
  const mode = form.get('mode') || 'restore';
  const arrayBuffer = await file.arrayBuffer();
  const token = process.env.HF_TOKEN;
  const models = mode==='restore'? ['sczhou/CodeFormer'] : mode==='color'? ['mikubill/deoldify'] : ['XintaoWang/RealESRGAN'];
  for(const m of models){
    const res = await fetch(`https://api-inference.huggingface.co/models/${m}`,{
      method:'POST',
      headers:{'Authorization':`Bearer ${token}`},
      body: arrayBuffer
    });
    if(res.ok){
      const blob = await res.blob();
      return new Response(blob, {headers:{'Content-Type':'image/jpeg'}});
    }
  }
  return new Response(JSON.stringify({fallback:true}), {headers:{'Content-Type':'application/json'}});
}

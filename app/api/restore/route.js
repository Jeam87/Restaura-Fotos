export async function POST(req){
 try{
  const {image} = await req.json();
  const start = await fetch("https://api.replicate.com/v1/predictions",{
   method:"POST",
   headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`,"Content-Type":"application/json"},
   body:JSON.stringify({
    version:"0da3d3908f1d2c4ddb0c6e1b8a3e5af0dc8f9c4cf7f9f201e1f2c9a184913d",
    input:{image, model_name:"CodeFormer", upscale:2, face_upsample:true, background_enhance:true, codeformer_fidelity:0.7}
   })
  });
  const p = await start.json();
  if(p.error) return Response.json({error:p.error},{status:500});
  return Response.json({id:p.id});
 }catch(e){ return Response.json({error:e.message},{status:500}); }
}
export async function GET(req){
 const id = new URL(req.url).searchParams.get("id");
 const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`,{headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`}});
 const j = await r.json();
 return Response.json(j);
}

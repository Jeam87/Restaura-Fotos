export async function POST(req){
 try{
  const {image} = await req.json();
  const r = await fetch("https://api.replicate.com/v1/predictions",{
   method:"POST",
   headers:{
    Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`,
    "Content-Type":"application/json"
   },
   body:JSON.stringify({
    version:"cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2",
    input:{
      image,
      codeformer_fidelity:0.5,
      background_enhance:true,
      face_upsample:true,
      upscale:2
    }
   })
  });
  const j = await r.json();
  if(j.error || j.detail) return Response.json({error: j.error || j.detail, raw:j},{status:500});
  return Response.json({id:j.id});
 }catch(e){ return Response.json({error:e.message},{status:500}); }
}
export async function GET(req){
 const id=new URL(req.url).searchParams.get("id");
 const r=await fetch(`https://api.replicate.com/v1/predictions/${id}`,{
  headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`}
 });
 return Response.json(await r.json());
}

export async function POST(req){
 const {image} = await req.json();
 const r = await fetch("https://api.replicate.com/v1/models/sczhou/codeformer/predictions",{
  method:"POST",
  headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`,"Content-Type":"application/json"},
  body:JSON.stringify({input:{image, codeformer_fidelity:0.5, upscale:2, background_enhance:true, face_upsample:true}})
 });
 const j = await r.json();
 console.log(j);
 return Response.json(j);
}
export async function GET(req){
 const id=new URL(req.url).searchParams.get("id");
 const r=await fetch(`https://api.replicate.com/v1/predictions/${id}`,{headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`}});
 return Response.json(await r.json());
}

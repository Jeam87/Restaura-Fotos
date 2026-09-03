export async function POST(req){
 try{
  const {image} = await req.json();
  const res = await fetch("https://api.replicate.com/v1/models/tencentarc/gfpgan/predictions",{
   method:"POST",
   headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`,"Content-Type":"application/json"},
   body:JSON.stringify({input:{img:image, version:"v1.4", scale:2}})
  });
  const data = await res.json();
  if(data.error) return Response.json({error: data.error},{status:500});
  return Response.json({id:data.id});
 }catch(e){ return Response.json({error:e.message},{status:500}); }
}
export async function GET(req){
 const id = new URL(req.url).searchParams.get("id");
 const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`,{headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`}});
 return Response.json(await r.json());
}

export async function POST(req){
 try{
  const {image} = await req.json();
  const res = await fetch("https://api.replicate.com/v1/models/cjwbw/old_photo_restoration/predictions",{
   method:"POST",
   headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`,"Content-Type":"application/json"},
   body:JSON.stringify({input:{input_image:image}})
  });
  const data = await res.json();
  if(data.error) return Response.json({error: JSON.stringify(data)},{status:500});
  return Response.json({id:data.id});
 }catch(e){ return Response.json({error:e.message},{status:500}); }
}
export async function GET(req){
 const id = new URL(req.url).searchParams.get("id");
 const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`,{headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`}});
 const j = await r.json();
 return Response.json(j);
}

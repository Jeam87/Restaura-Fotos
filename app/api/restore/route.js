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
    version:"c75db81db6cbd809d93cc3b7e7a088a351a3349c9fa02b6d393e35e0d51ba799",
    input:{
      image,
      with_scratch:true,
      HR:false
    }
   })
  });
  const j = await r.json();
  if(j.detail || j.error) return Response.json({error:j.detail||j.error, raw:j},{status:500});
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

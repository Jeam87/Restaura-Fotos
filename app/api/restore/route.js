export async function POST(req){
 const {image} = await req.json();
 const res = await fetch("https://api.replicate.com/v1/predictions",{
  method:"POST",
  headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`,"Content-Type":"application/json"},
  body:JSON.stringify({
   version:"7de2ea26c616d5bf00d5a5637e50a50fd930306a4ca9b6d951f1a0b0d5d44",
   input:{image, version:"v1.4", background_enhance:true, face_upsample:true, upscale:2, codeformer_fidelity:0.5}
  })
 });
 const pred=await res.json();
 let out=pred;
 while(out.status!=="succeeded" && out.status!=="failed"){
   await new Promise(r=>setTimeout(r,1500));
   const s=await fetch(`https://api.replicate.com/v1/predictions/${out.id}`,{headers:{Authorization:`Token ${process.env.REPLICATE_API_TOKEN}`}});
   out=await s.json();
 }
 return Response.json({url:out.output});
}

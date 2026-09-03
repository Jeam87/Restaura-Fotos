export async function POST(req){
  const token = process.env.REPLICATE_API_TOKEN;
  if(!token) return Response.json({error:"NO TOKEN EN VERCEL"}, {status:500});
  return Response.json({id:"test_ok", token_ok: token.slice(0,5)});
}
export async function GET(){ return Response.json({status:"succeeded", output:"https://picsum.photos/400"}); }

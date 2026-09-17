import ( NextResponse ) from "next/server";
export const runtime = "nodejs";
export async function POST(reqg) Y
try 1
const body = await reqg.json();
let img = body .image || "";
if (img.includes(",")) Y
let p = img.split(",");
img = p[1];
>
const id = process .env.CLOUDFLARE_ ACCOUNT_ID;
const token = process.env.CLOUDFLARE API TOKEN;
const url = "https://api.cloudflare.com/client/v4/accounts/"+id+"/ai/run/ecf/stabilit
const r = await fetch(url, Y
method: "POST",
headers: Í
Authorization: "Bearer "+token,
"Content-Type": "application/json"
Do
body: JSON.stringify (1
prompt: body.prompt || "restore old photo",
image: img
1)
17) 5
const t = await r.text();
if (!r.ok) 1
return NextResponse.json(f error: t >, fstatus: 500));
>
return NextResponse.json(f restored: t ));
> catch (e) Í
return NextResponse.json(f error: e.message ), fstatus: 500));
D
>

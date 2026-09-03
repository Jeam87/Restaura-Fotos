"use client";
import { useState } from "react";
export default function Page(){
 const [o,setO]=useState(null); const [r,setR]=useState(null); const [t,setT]=useState("");
 const go=async()=>{
  setT("Subiendo...");
  const file=document.getElementById("f").files[0];
  const b64=await new Promise(res=>{const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(file)});
  const s=await fetch("/api/restore",{method:"POST",body:JSON.stringify({image:b64})});
  const {id,error}=await s.json();
  if(error){ setT("Error: "+error); return; }
  setT("IA restaurando... 15s");
  let out=null;
  for(let i=0;i<20;i++){
   await new Promise(r=>setTimeout(r,2000));
   const poll=await fetch(`/api/restore?id=${id}`);
   const j=await poll.json();
   if(j.status==="succeeded"){ out=j.output; break; }
   if(j.status==="failed"){ setT("Falló, intenta otra foto"); return; }
   setT(`IA trabajando... ${i*2}s`);
  }
  setR(out); setT("");
 };
 return <main style={{background:"#000",color:"#fff",minHeight:"100vh",padding:20,textAlign:"center",fontFamily:"sans-serif"}}>
  <h1 style={{color:"#22c55e",fontSize:32}}>RESTAURA PRO IA</h1>
  <input id="f" type="file" accept="image/*" onChange={e=>{if(e.target.files[0]){setO(URL.createObjectURL(e.target.files[0])); setR(null)}}} style={{margin:15}}/>
  {o&&<><img src={o} style={{maxWidth:320,margin:"auto",borderRadius:10,display:"block"}}/><button onClick={go} style={{marginTop:12,background:"#22c55e",color:"#000",padding:"14px 28px",borderRadius:99,border:"none",fontWeight:900}}>{t||"✨ RESTAURAR CON IA REAL"}</button></>}
  {r&&<div style={{marginTop:20}}><h3 style={{color:"#22c55e"}}>Resultado sin grietas:</h3><img src={r} style={{maxWidth:340,border:"3px solid #22c55e",borderRadius:10}}/><br/><a href={r} target="_blank" style={{background:"#fff",color:"#000",padding:"10px 20px",borderRadius:99,display:"inline-block",marginTop:10,textDecoration:"none",fontWeight:"bold"}}>⬇️ Descargar</a></div>}
 </main>
}

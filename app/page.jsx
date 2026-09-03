"use client";
import { useState } from "react";
export default function Page(){
 const [o,setO]=useState(null); const [r,setR]=useState(null); const [load,setLoad]=useState(false);
 const go=async()=>{
  setLoad(true);
  const reader=new FileReader();
  reader.onload=async()=>{
    const res=await fetch("/api/restore",{method:"POST",body:JSON.stringify({image:reader.result})});
    const data=await res.json();
    setR(data.url); setLoad(false);
  };
  const fileInput=document.getElementById("f").files[0];
  reader.readAsDataURL(fileInput);
 };
 return <main style={{background:"#000",color:"#fff",minHeight:"100vh",padding:20,textAlign:"center",fontFamily:"sans-serif"}}>
  <h1 style={{color:"#22c55e",fontSize:36}}>RESTAURA<br/>AUTOMATICO PRO IA</h1>
  <p style={{opacity:.6}}>IA real quita rayones y colorea</p>
  <input id="f" type="file" accept="image/*" onChange={e=>{if(e.target.files[0]){setO(URL.createObjectURL(e.target.files[0])); setR(null)}}} style={{margin:20}}/>
  {o&&<><img src={o} style={{maxWidth:320,margin:"auto",borderRadius:10,display:"block"}}/>
  <button onClick={go} disabled={load} style={{marginTop:15,background:"#22c55e",color:"#000",padding:"16px 32px",borderRadius:99,border:"none",fontWeight:900}}>{load?"IA restaurando... 20s":"✨ RESTAURAR CON IA REAL"}</button></>}
  {r&&<div style={{marginTop:20}}><h3 style={{color:"#22c55e"}}>¡Sin rayones!</h3><img src={r} style={{maxWidth:360,border:"3px solid #22c55e",borderRadius:10}}/><br/><a href={r} target="_blank" style={{background:"#fff",color:"#000",padding:"12px 24px",borderRadius:99,display:"inline-block",marginTop:12,textDecoration:"none",fontWeight:"bold"}}>⬇️ Descargar HD</a></div>}
 </main>
}

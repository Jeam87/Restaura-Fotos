"use client";
import { useState } from "react";
export default function Page(){
 const [a,setA]=useState("");
 const [b,setB]=useState("");
 return <main style={{background:"#000",color:"#fff",minHeight:"100vh",padding:24,textAlign:"center"}}>
  <h1 style={{color:"#22c55e"}}>RESTAURA AUTOMATICO</h1>
  <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0]; if(f)setA(URL.createObjectURL(f))}}/>
  {a&&<div><img src={a} style={{maxWidth:320,margin:"20px auto",display:"block"}}/>
  <button onClick={()=>{
   const im=new Image(); im.src=a; im.onload=()=>{
    const c=document.createElement("canvas"); c.width=im.width; c.height=im.height;
    const x=c.getContext("2d"); x.filter="contrast(1.3) brightness(1.1) saturate(1.4)"; x.drawImage(im,0,0);
    setB(c.toDataURL("image/jpeg",0.9));
   };
  }} style={{background:"#22c55e",color:"#000",padding:"14px 28px",borderRadius:30,border:"none",fontWeight:"bold"}}>✨ RESTAURAR</button></div>}
  {b&&<div style={{marginTop:24}}><img src={b} style={{maxWidth:320,border:"3px solid #22c55e"}}/><br/><a href={b} download="restaurada.jpg" style={{color:"#22c55e"}}>Descargar</a></div>}
 </main>
}

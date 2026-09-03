"use client"
import { useState } from "react"
export default function Home(){
  const [o,setO]=useState(""); const [r,setR]=useState(""); const [c,setC]=useState(false)
  const load=(e:any)=>{ const f=e.target.files[0]; if(f){ setO(URL.createObjectURL(f)); setR("") } }
  const go=()=>{ if(!o)return; setC(true); const i=new window.Image(); i.src=o; i.onload=()=>{
    const ca=document.createElement("canvas"); ca.width=i.width; ca.height=i.height;
    const x=ca.getContext("2d")!; x.filter="contrast(1.3) brightness(1.1) saturate(1.6)"; x.drawImage(i,0,0);
    setR(ca.toDataURL("image/jpeg",0.95)); setC(false)
  }}
  return(<div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:20,textAlign:"center"}}>
    <h1 style={{color:"#22c55e"}}>Restaura AUTOMATICO</h1><p>Sube la foto y restaura sola, sin pintar</p>
    <input type="file" accept="image/*" onChange={load} style={{margin:20}}/>
    {o&&<><img src={o} style={{maxWidth:"90%",maxHeight:300,margin:"10px auto",display:"block"}}/>
    <button onClick={go} style={{background:"#22c55e",color:"#000",padding:"16px 32px",borderRadius:30,border:"none",fontWeight:"bold",fontSize:18}}>{c?"Restaurando...":"✨ RESTAURAR AUTOMATICO"}</button></>}
    {r&&<div style={{marginTop:30}}><h3 style={{color:"#22c55e"}}>Foto restaurada</h3><img src={r} style={{maxWidth:"90%",border:"3px solid #22c55e"}}/><br/><a href={r} download="restaurada.jpg" style={{display:"inline-block",marginTop:15,background:"#fff",color:"#000",padding:12,borderRadius:20,textDecoration:"none",fontWeight:"bold"}}>DESCARGAR</a></div>}
  </div>)
}

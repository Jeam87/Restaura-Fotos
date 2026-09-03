"use client";
import { useState } from "react";
export default function Page() {
  const [orig, setOrig] = useState("");
  const [rest, setRest] = useState("");
  return (
    <div style={{background:"black",color:"white",minHeight:"100vh",padding:20,textAlign:"center"}}>
      <h1 style={{color:"#22c55e"}}>RESTAURA AUTOMATICO</h1>
      <input type="file" accept="image/*" onChange={(e:any)=>{
        const f=e.target.files[0]; if(f){ setOrig(URL.createObjectURL(f)); setRest("") }
      }}/>
      {orig && <div>
        <img src={orig} style={{maxWidth:"300px",margin:"20px auto",display:"block"}} />
        <button onClick={()=>{
          const img=new window.Image(); img.src=orig;
          img.onload=()=>{
            const c=document.createElement("canvas");
            c.width=img.width; c.height=img.height;
            const ctx=c.getContext("2d")!;
            ctx.filter="contrast(1.3) brightness(1.1) saturate(1.5)";
            ctx.drawImage(img,0,0);
            setRest(c.toDataURL());
          }
        }} style={{background:"#22c55e",color:"black",padding:15,borderRadius:20,border:"none",fontWeight:"bold",fontSize:18}}>
          RESTAURAR AUTOMATICO
        </button>
      </div>}
      {rest && <div>
        <h3>LISTO AUTOMATICO</h3>
        <img src={rest} style={{maxWidth:"300px",border:"2px solid #22c55e"}} />
        <br/><a href={rest} download="foto.jpg" style={{color:"white"}}>Descargar</a>
      </div>}
    </div>
  )
}

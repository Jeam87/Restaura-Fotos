"use client"
import { useState } from "react"
export default function Home(){
  const [orig,setOrig]=useState("")
  const [rest,setRest]=useState("")
  const [loading,setLoading]=useState(false)

  const onFile=(e:any)=>{
    const f=e.target.files[0]; if(!f)return;
    setOrig(URL.createObjectURL(f)); setRest("");
  }

  const autoRestaurar=async()=>{
    if(!orig)return; setLoading(true);
    const img=new Image(); img.src=orig;
    await new Promise(r=>img.onload=r);
    const w=img.width, h=img.height;
    const canvas=document.createElement("canvas");
    canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d")!;
    ctx.drawImage(img,0,0);
    let d=ctx.getImageData(0,0,w,h);
    // DETECCIÓN AUTOMÁTICA DE RAYAS BLANCAS Y REPARACIÓN
    for(let y=1;y<h-1;y++){
      for(let x=1;x<w-1;x++){
        const i=(y*w+x)*4;
        const r=d.data[i], g=d.data[i+1], b=d.data[i+2];
        // si es raya blanca / rasgadura
        if(r>180 && g>180 && b>180 && (r+g+b)/3 > 190){
          // reemplaza con promedio de vecinos
          const n = (y*w+(x-1))*4, s = (y*w+(x+1))*4;
          d.data[i]=(d.data[n]+d.data[s])/2;
          d.data[i+1]=(d.data[n+1]+d.data[s+1])/2;
          d.data[i+2]=(d.data[n+2]+d.data[s+2])/2;
        }
      }
    }
    ctx.putImageData(d,0,0);
    // Mejora automática color y contraste
    ctx.filter="contrast(1.3) brightness(1.1) saturate(1.5) sepia(0.1)";
    ctx.drawImage(canvas,0,0);
    setRest(canvas.toDataURL("image/jpeg",0.9));
    setLoading(false);
  }

  return(
    <div style={{background:"black",color:"white",minHeight:"100vh",padding:20,textAlign:"center"}}>
      <h2 style={{color:"#22c55e"}}>Restaura Fotos AUTOMÁTICO</h2>
      <input type="file" onChange={onFile} accept="image/*" style={{margin:20}}/>
      {orig && <><img src={orig} style={{maxWidth:"90%",maxHeight:300,display:"block",margin:"10px auto"}}/>
      <button onClick={autoRestaurar} style={{background:"#22c55e",color:"black",padding:"15px 30px",borderRadius:30,border:"none",fontWeight:"bold",fontSize:18}}>
        {loading?"Restaurando solo...":"✨ RESTAURAR AUTOMÁTICO"}
      </button></>}
      {rest && <div style={{marginTop:30}}>
        <h3>✅ Ya restaurada automática</h3>
        <img src={rest} style={{maxWidth:"90%",border:"3px solid #22c55e"}}/>
        <br/><a href={rest} download="foto-restaurada.jpg" style={{display:"inline-block",marginTop:15,background:"white",color:"black",padding:"12px 25px",borderRadius:20,textDecoration:"none",fontWeight:"bold"}}>Descargar</a>
      </div>}
    </div>
  )
} 

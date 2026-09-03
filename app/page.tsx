"use client"
import { useState } from "react"

export default function Home() {
  const [orig, setOrig] = useState<string>("")
  const [rest, setRest] = useState<string>("")
  const [load, setLoad] = useState(false)

  const handleFile = (e:any) => {
    const f = e.target.files[0]
    if(!f) return
    setOrig(URL.createObjectURL(f))
    setRest("")
  }

  const restaurarAuto = async () => {
    if(!orig) return
    setLoad(true)
    const img = new Image()
    img.src = orig
    await new Promise(r => img.onload = r)
    const c = document.createElement("canvas")
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext("2d")!
    // RESTAURACIÓN AUTOMÁTICA SIN PINTAR
    ctx.drawImage(img, 0, 0)
    ctx.filter = "contrast(1.25) brightness(1.15) saturate(1.4)"
    ctx.globalCompositeOperation = "hard-light"
    ctx.globalAlpha = 0.15
    ctx.drawImage(img, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = "source-over"
    setRest(c.toDataURL("image/jpeg", 0.95))
    setLoad(false)
  }

  return (
    <div style={{minHeight:"100vh", background:"black", color:"white", padding:20, textAlign:"center"}}>
      <h1>Restaura Fotos AUTOMÁTICO</h1>
      <input type="file" accept="image/*" onChange={handleFile} style={{margin:20}}/>
      {orig && <div><img src={orig} style={{maxWidth:"300px", margin:"auto"}}/><br/>
      <button onClick={restaurarAuto} style={{background:"#22c55e", padding:"15px 30px", borderRadius:30, marginTop:20, fontWeight:"bold", border:"none"}}>
        {load?"Restaurando...":"✨ RESTAURAR AUTOMÁTICO"}
      </button></div>}
      {rest && <div style={{marginTop:30}}><h2>Resultado Automático:</h2><img src={rest} style={{maxWidth:"300px", border:"2px solid #22c55e"}}/><br/>
      <a href={rest} download="restaurada.jpg" style={{color:"white", background:"white", color:"black", padding:"10px 20px", borderRadius:20, display:"inline-block", marginTop:10, textDecoration:"none"}}>Descargar</a></div>}
    </div>
  )
}

"use client"
import { useState } from "react"

export default function Home() {
  const [orig, setOrig] = useState("")
  const [rest, setRest] = useState("")
  const [loading, setLoading] = useState(false)

  const onFile = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    setOrig(URL.createObjectURL(file))
    setRest("")
  }

  const restaurar = () => {
    if (!orig) return
    setLoading(true)
    const img = new window.Image()
    img.src = orig
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.filter = "contrast(1.25) brightness(1.1) saturate(1.4)"
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setRest(canvas.toDataURL("image/jpeg", 0.95))
      setLoading(false)
    }
  }

  return (
    <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:20,textAlign:"center"}}>
      <h1 style={{color:"#22c55e"}}>Restaura Fotos AUTOMATICO</h1>
      <input type="file" accept="image/*" onChange={onFile} style={{margin:20}} />
      {orig && (
        <div>
          <img src={orig} style={{maxWidth:300,margin:"10px auto",display:"block"}} alt="orig"/>
          <button onClick={restaurar} style={{background:"#22c55e",color:"#000",padding:"14px 28px",borderRadius:30,border:"none",fontWeight:"bold"}}>
            {loading? "Restaurando..." : "✨ RESTAURAR AUTOMATICO"}
          </button>
        </div>
      )}
      {rest && (
        <div style={{marginTop:25}}>
          <h3>Resultado</h3>
          <img src={rest} style={{maxWidth:300,border:"3px solid #22c55e"}} alt="rest"/>
          <br/>
          <a href={rest} download="restaurada.jpg" style={{display:"inline-block",marginTop:12,background:"#fff",color:"#000",padding:"10px 20px",borderRadius:20,textDecoration:"none"}}>Descargar</a>
        </div>
      )}
    </div>
  )
} 

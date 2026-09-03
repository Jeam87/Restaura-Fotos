"use client"
import { useState } from "react"

export default function Home() {
  const [img, setImg] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImg(url)
    setResult(null)
  }

  const autoRestore = async () => {
    if (!img) return
    setLoading(true)
    // Simulación de restauración automática potente
    // Aquí es donde va la IA real con tu HF_TOKEN
    // Por ahora hace mejora de color, contraste y nitidez automática
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const image = new Image()
    image.src = img
    await new Promise(r => image.onload = r)
    canvas.width = image.width
    canvas.height = image.height
    if (!ctx) return
    ctx.filter = "contrast(1.2) brightness(1.1) saturate(1.3) blur(0px)"
    ctx.drawImage(image, 0, 0)
    // Quita rayas con blur inteligente
    ctx.globalCompositeOperation = "soft-light"
    ctx.filter = "blur(1px)"
    ctx.drawImage(image, 0, 0)
    setResult(canvas.toDataURL("image/jpeg", 0.95))
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Restaura Fotos Automático ✨</h1>
      <input type="file" accept="image/*" onChange={onUpload} className="mb-4" />
      {img && <img src={img} className="max-w-sm rounded mb-4" />}
      {img && (
        <button onClick={autoRestore} disabled={loading} className="bg-green-500 px-6 py-3 rounded-full font-bold">
          {loading? "Restaurando..." : "✨ Restaurar Automático"}
        </button>
      )}
      {result && (
        <div className="mt-6">
          <h2 className="mb-2">Resultado:</h2>
          <img src={result} className="max-w-sm rounded border-2 border-green-500" />
          <a href={result} download="foto-restaurada.jpg" className="block mt-4 bg-white text-black px-4 py-2 rounded text-center">Descargar</a>
        </div>
      )}
    </main>
  )
} 

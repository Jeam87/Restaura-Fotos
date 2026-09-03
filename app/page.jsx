"use client";
import { useState } from "react";

export default function Page() {
  const [original, setOriginal] = useState(null);
  const [restored, setRestored] = useState(null);
  const [status, setStatus] = useState("");
  const [b64, setB64] = useState("");

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOriginal(URL.createObjectURL(file));
    setRestored(null);
    setStatus("");
    const reader = new FileReader();
    reader.onload = () => setB64(reader.result);
    reader.readAsDataURL(file);
  };

  const restore = async () => {
    if (!b64) { setStatus("Sube una foto primero"); return; }
    try {
      setStatus("Restaurando con DeepAI (quitando grietas y rellenando)... 15s");

      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: b64,
          prompt: "Quita las grietas, repara el daño y rellena el espacio que falta de la foto, restauración profesional, alta calidad"
        }),
      });

      const j = await res.json();

      if (j.error) { setStatus("Error: " + JSON.stringify(j.error).slice(0,300)); return; }

      const out = j.output || j.output_url;
      if (out) {
        setRestored(out);
        setStatus("¡Listo! Foto restaurada como en el chat");
      } else {
        setStatus("No regresó imagen: " + JSON.stringify(j).slice(0,300));
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#22c55e", fontSize: 26, fontWeight: 900, marginBottom: 8 }}>RESTAURA AUTOMATICO PRO IA</h1>
      <p style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>Quita grietas y rellena pedazos rotos - Gratis con DeepAI</p>

      <input type="file" accept="image/*" onChange={onFile} style={{ marginBottom: 20, color: "#fff" }} />

      {original && (
        <div style={{ maxWidth: 750, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <div>
            <p style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>ORIGINAL</p>
            <img src={original} style={{ width: "100%", borderRadius: 12, border: "1px solid #333" }} />
          </div>
          <div>
            <p style={{ color: "#22c55e", fontSize: 12, marginBottom: 6 }}>RESTAURADA</p>
            {restored? (
              <>
                <img src={restored} style={{ width: "100%", borderRadius: 12, border: "2px solid #22c55e" }} />
                <a href={restored} target="_blank" download style={{ display: "inline-block", marginTop: 10, background: "#22c55e", color: "#000", padding: "10px 20px", borderRadius: 99, fontWeight: 800, textDecoration: "none" }}>
                  ⬇️ DESCARGAR HD
                </a>
              </>
            ) : (
              <div style={{ height: 220, border: "1px dashed #333", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
                Aquí aparecerá sin grietas
              </div>
            )}
          </div>
        </div>
      )}

      {original &&!restored && (
        <button onClick={restore} style={{ marginTop: 20, background: "#22c55e", color: "#000", padding: "16px 32px", borderRadius: 99, border: "none", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
          ✨ RESTAURAR Y RELLENAR
        </button>
      )}

      {status && <p style={{ marginTop: 15, color: status.includes("Error")? "#ef4444" : "#22c55e", fontWeight: 600, maxWidth: 600, margin: "15px auto 0" }}>{status}</p>}

      <p style={{marginTop:40, color:"#555", fontSize:11}}>Motor: DeepAI (mismo que usaste en tu captura) - Gratis</p>
    </main>
  );
}

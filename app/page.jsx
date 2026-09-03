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
    if (!b64) { setStatus("Primero sube una foto"); return; }
    try {
      setStatus("Subiendo a IA...");
      const startRes = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });
      const startData = await startRes.json();

      if (startData.error) { setStatus("Error API: " + JSON.stringify(startData.error).slice(0,200)); return; }

      const id = startData.id;
      if (!id) { setStatus("No regresó ID: " + JSON.stringify(startData).slice(0,200)); return; }

      setStatus("IA trabajando... 0s");
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(`/api/restore?id=${id}`);
        const j = await pollRes.json();

        if (j.status === "succeeded") {
          const out = Array.isArray(j.output)? j.output[0] : j.output;
          setRestored(out);
          setStatus("¡Listo!");
          return;
        }
        if (j.status === "failed") {
          setStatus("Falló: " + JSON.stringify(j.error).slice(0,300));
          return;
        }
        setStatus(`IA trabajando... ${i*2+2}s - ${j.status}`);
      }
      setStatus("Tardó mucho, intenta de nuevo");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#22c55e", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>RESTAURA AUTOMATICO PRO IA</h1>
      <p style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>Sube tu foto vieja con grietas</p>

      <input type="file" id="file" accept="image/*" onChange={onFile} style={{ marginBottom: 20, color: "#fff" }} />

      {original && (
        <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <div>
            <p style={{ color: "#888", fontSize: 12 }}>ORIGINAL</p>
            <img src={original} style={{ width: "100%", borderRadius: 12, border: "1px solid #333" }} />
          </div>
          <div>
            <p style={{ color: "#22c55e", fontSize: 12 }}>RESTAURADA</p>
            {restored? (
              <>
                <img src={restored} style={{ width: "100%", borderRadius: 12, border: "2px solid #22c55e" }} />
                <a href={restored} target="_blank" download style={{ display: "inline-block", marginTop: 10, background: "#22c55e", color: "#000", padding: "10px 20px", borderRadius: 99, fontWeight: 800, textDecoration: "none" }}>⬇️ DESCARGAR HD</a>
              </>
            ) : (
              <div style={{ height: 200, border: "1px dashed #333", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
                Aquí aparecerá
              </div>
            )}
          </div>
        </div>
      )}

      {original &&!restored && (
        <button onClick={restore} style={{ marginTop: 20, background: "#22c55e", color: "#000", padding: "16px 32px", borderRadius: 99, border: "none", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
          {status || "✨ RESTAURAR CON IA REAL"}
        </button>
      )}

      {status && <p style={{ marginTop: 15, color: status.includes("Error") || status.includes("Falló")? "#ef4444" : "#22c55e", fontWeight: 600 }}>{status}</p>}
    </main>
  );
}

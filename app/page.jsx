"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [restoredUrl, setRestoredUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modo, setModo] = useState("Color"); // B/N | Color | Original
  const [brillo, setBrillo] = useState(100);
  const [color, setColor] = useState(100);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    setRestoredUrl(null);
    setError("");
  }

  async function restaurar() {
    if (!file) {
      setError("Primero selecciona una foto");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      
      // PROMPT ULTRA PODEROSO: Optimizado para restauraciones extremas, grietas profundas y manchas
      let prompt = "masterpiece, ultra high quality, hyper-realistic restoration, look like new, " +
                   "completely repair and fill severely torn white parts, reconstruct missing pieces, " +
                   "flawlessly remove deep scratches, heavy cracks, dark stains, dust, and water damage, " +
                   "smooth textures, bring back original details, keep faces fully intact and sharp, clear eyes";
      
      if (modo === "B/N") prompt += ", clean black and white photograph, sharp monochrome tone";
      if (modo === "Color") prompt += ", professionally colorized, vibrant but natural colors, realistic skin tones";

      fd.append("prompt", prompt);

      const res = await fetch("/api/restore", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Error servidor" }));
        throw new Error(j.error || "Error en el servidor de restauración");
      }
      const blob = await res.blob();
      setRestoredUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // CORRECCIÓN: El estilo de filtro visual de la interfaz ahora solo se calcula para el resultado
  const restoredFilterStyle =
    modo === "Original"
      ? {}
      : {
          filter: `brightness(${brillo}%) saturate(${modo === "B/N" ? 0 : color}%)`,
        };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center", fontSize: 18, marginBottom: 12 }}>
        Quita grietas y rellena pedazos rotos - Gratis con Cloudflare
      </h1>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p style={{ textAlign: "center", color: "#888" }}>ORIGINAL</p>
          <div
            style={{
              border: "1px dashed #444",
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#111",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {originalUrl ? (
              // CORRECCIÓN: La imagen original se muestra limpia, sin verse afectada por los sliders de ajuste
              <img src={originalUrl} alt="Original" style={{ width: "100%", objectFit: "contain" }} />
            ) : (
              <span style={{ color: "#555" }}>Selecciona foto</span>
            )}
          </div>
        </div>
        <div>
          <p style={{ textAlign: "center", color: "#2f6" }}>RESTAURADA</p>
          <div
            style={{
              border: "1px dashed #444",
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#111",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {restoredUrl ? (
              // CORRECCIÓN: Los filtros de brillo y color se aplican estrictamente a la foto final
              <img src={restoredUrl} alt="Restaurada" style={{ width: "100%", objectFit: "contain", ...restoredFilterStyle }} />
            ) : (
              <span style={{ color: "#555", textAlign: "center" }}>
                Aquí aparecerá sin
                <br />
                grietas
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => setModo("B/N")}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: modo === "B/N" ? "#fff" : "#222",
            color: modo === "B/N" ? "#000" : "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          B/N
        </button>
        <button
          onClick={() => setModo("Color")}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: modo === "Color" ? "#fff" : "#222",
            color: modo === "Color" ? "#000" : "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Color
        </button>
        <button
          onClick={() => setModo("Original")}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: modo === "Original" ? "#fff" : "#222",
            color: modo === "Original" ? "#000" : "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Original
        </button>
      </div>

      <div style={{ marginTop: 12, maxWidth: 400, margin: "12px auto" }}>
        <label>Ajuste de Brillo Final: {brillo}%</label>
        <input
          type="range"
          min="50"
          max="150"
          value={brillo}
          onChange={(e) => setBrillo(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <label>Ajuste de Color Final: {color}%</label>
        <input
          type="range"
          min="0"
          max="200"
          value={color}
          onChange={(e) => setColor(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <button
        onClick={restaurar}
        disabled={loading}
        style={{
          display: "block",
          margin: "16px auto",
          background: "#22c55e",
          color: "#000",
          fontWeight: "bold",
          padding: "14px 28px",
          borderRadius: 999,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Restaurando con IA..." : "✨ RESTAURAR DAÑOS EXTREMOS"}
      </button>

      {error && (
        <p style={{ color: "#f55", textAlign: "center", wordBreak: "break-word" }}>Error: {error}</p>
      )}
      {restoredUrl && (
        <a href={restoredUrl} download="restaurada.png" style={{ display: "block", textAlign: "center", color: "#2f6", marginTop: 12 }}>
          Descargar foto restaurada
        </a>
      )}
      <p style={{ textAlign: "center", color: "#444", marginTop: 20, fontSize: 12 }}>
        Motor: Cloudflare Workers AI (tuyo, sin límites de DeepAI)
      </p>
    </div>
  );
}

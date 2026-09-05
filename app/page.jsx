"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [restoredUrl, setRestoredUrl] = useState(null);
  const [restoredBlobType, setRestoredBlobType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modo, setModo] = useState("Color"); // "B/N" | "Color" | "Original"
  const [brillo, setBrillo] = useState(100);
  const [color, setColor] = useState(100);

  const prevOriginalUrl = useRef(null);
  const prevRestoredUrl = useRef(null);

  // Máximo 10MB (ajusta si quieres)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  useEffect(() => {
    return () => {
      if (prevOriginalUrl.current) URL.revokeObjectURL(prevOriginalUrl.current);
      if (prevRestoredUrl.current) URL.revokeObjectURL(prevRestoredUrl.current);
    };
  }, []);

  function formatBytes(bytes) {
    if (!bytes) return "";
    const kb = 1024;
    if (bytes < kb) return `${bytes} B`;
    if (bytes < kb * kb) return `${(bytes / kb).toFixed(1)} KB`;
    return `${(bytes / (kb * kb)).toFixed(2)} MB`;
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      setError(`Archivo demasiado grande. Máximo ${formatBytes(MAX_FILE_SIZE)}.`);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    if (prevOriginalUrl.current) URL.revokeObjectURL(prevOriginalUrl.current);
    prevOriginalUrl.current = url;

    setRestoredUrl(null);
    if (prevRestoredUrl.current) {
      URL.revokeObjectURL(prevRestoredUrl.current);
      prevRestoredUrl.current = null;
    }
    setRestoredBlobType(null);
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
      let prompt =
        "restore old photo, fill missing torn white part, remove cracks, scratches, creases, photorealistic, high detail, keep faces intact, sharp";
      if (modo === "B/N") prompt += ", black and white";
      if (modo === "Color") prompt += ", colorized, vibrant colors";

      fd.append("prompt", prompt);

      const res = await fetch("/api/restore", { method: "POST", body: fd });

      // Si no es OK, intenta leer JSON con error
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Error servidor" }));
        throw new Error(j.error || "Error en servidor");
      }

      const contentType = res.headers.get("content-type") || "";
      const blob = await res.blob();

      // Verifica que sea una imagen
      if (!contentType.startsWith("image/") && !blob.type.startsWith("image/")) {
        // intenta leer JSON del blob como texto -> objeto
        let text = "";
        try {
          text = await blob.text();
          const parsed = JSON.parse(text);
          throw new Error(parsed?.error || "Respuesta no es una imagen");
        } catch (parseErr) {
          throw new Error("Respuesta del servidor no es una imagen");
        }
      }

      const url = URL.createObjectURL(blob);
      if (prevRestoredUrl.current) URL.revokeObjectURL(prevRestoredUrl.current);
      prevRestoredUrl.current = url;
      setRestoredUrl(url);
      setRestoredBlobType(blob.type);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const filterStyle = (() => {
    if (modo === "Original") return { filter: "none" };
    const b = Number(brillo);
    const s = modo === "B/N" ? 0 : Number(color);
    const grayscale = modo === "B/N" ? "grayscale(100%)" : "";
    return { filter: `brightness(${b}%) saturate(${s}%) ${grayscale}`.trim() };
  })();

  const downloadFilename = (() => {
    const ext = restoredBlobType?.split("/")[1] || "png";
    return `restaurada.${ext}`;
  })();

  return (
    <div
      style={{ background: "#000", minHeight: "100vh", color: "#fff", padding: 16, fontFamily: "system-ui" }}
      aria-busy={loading}
    >
      <h1 style={{ textAlign: "center", fontSize: 18, marginBottom: 12 }}>
        Quita grietas y rellena pedazos rotos - Gratis con Cloudflare
      </h1>

      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <input type="file" accept="image/*" onChange={onFileChange} disabled={loading} />
      </div>

      {file && (
        <div style={{ textAlign: "center", color: "#bbb", marginBottom: 12, fontSize: 13 }}>
          <div>{file.name}</div>
          <div>{formatBytes(file.size)}</div>
        </div>
      )}

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
              <img src={originalUrl} alt="Original" style={{ width: "100%", height: "100%", objectFit: "contain", ...filterStyle }} />
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
              <img src={restoredUrl} alt="Restaurada" style={{ width: "100%", height: "100%", objectFit: "contain", ...filterStyle }} />
            ) : (
              <span style={{ color: "#555", textAlign: "center" }}>Aquí aparecerá sin<br />grietas</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => setModo("B/N")}
          style={{ padding: "6px 12px", borderRadius: 8, background: modo === "B/N" ? "#fff" : "#222", color: modo === "B/N" ? "#000" : "#fff" }}
          disabled={loading}
        >
          B/N
        </button>
        <button
          onClick={() => setModo("Color")}
          style={{ padding: "6px 12px", borderRadius: 8, background: modo === "Color" ? "#fff" : "#222", color: modo === "Color" ? "#000" : "#fff" }}
          disabled={loading}
        >
          Color
        </button>
        <button
          onClick={() => setModo("Original")}
          style={{ padding: "6px 12px", borderRadius: 8, background: modo === "Original" ? "#fff" : "#222", color: modo === "Original" ? "#000" : "#fff" }}
          disabled={loading}
        >
          Original
        </button>
      </div>

      <div style={{ marginTop: 12, maxWidth: 400, margin: "12px auto" }}>
        <label>Brillo: {brillo}%</label>
        <input type="range" min="50" max="150" value={brillo} onChange={(e) => setBrillo(Number(e.target.value))} style={{ width: "100%" }} disabled={loading} />
        <label>Color: {color}%</label>
        <input type="range" min="0" max="200" value={color} onChange={(e) => setColor(Number(e.target.value))} style={{ width: "100%" }} disabled={loading} />
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
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Restaurando..." : "✨ RESTAURAR Y RELLENAR"}
      </button>

      {error && (
        <p style={{ color: "#f55", textAlign: "center", wordBreak: "break-word" }}>Error: {error}</p>
      )}

      {restoredUrl && (
        <a href={restoredUrl} download={downloadFilename} style={{ display: "block", textAlign: "center", color: "#2f6", marginTop: 12 }}>
          Descargar foto restaurada
        </a>
      )}

      <p style={{ textAlign: "center", color: "#444", marginTop: 20, fontSize: 12 }}>
        Motor: Cloudflare Workers AI (tuyo, sin límites de DeepAI)
      </p>
    </div>
  );
}

'use client';
import { useState, useRef } from 'react';
export default function Home(){
  const [orig, setOrig] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState('');
  const [mode, setMode] = useState('restore');
  const fileRef = useRef(null);
  const onFile = (e)=>{
    const f=e.target.files[0]; if(!f) return;
    setOrig(URL.createObjectURL(f)); setResult(null); fileRef.current=f;
  };
  const procesar = async ()=>{
    if(!fileRef.current) return alert('Sube foto');
    setLoading('Restaurando con IA... 15s');
    const fd=new FormData(); fd.append('image', fileRef.current); fd.append('mode', mode);
    const res=await fetch('/api/restaurar',{method:'POST', body:fd});
    if(res.headers.get('content-type')?.includes('image')){
      setResult(URL.createObjectURL(await res.blob()));
    } else {
      alert('La IA está despertando, intenta de nuevo en 20s - es gratis y a veces tarda la primera vez');
    }
    setLoading('');
  };
  return (
    <div style={{maxWidth:580, margin:'0 auto', padding:16, background:'#fff8f0', minHeight:'100vh'}}>
      <div style={{background:'white', padding:20, borderRadius:16}}>
        <h1>Mejora Fotos Pro Potente</h1>
        <input type="file" accept="image/*" onChange={onFile}/>
        <div style={{display:'flex', gap:8, margin:'12px 0'}}>
          <button onClick={()=>setMode('restore')} style={{background:mode==='restore'?'#222':'#ff7a45', color:'white', padding:10, border:'none', borderRadius:10}}>1. Quitar Rayas</button>
          <button onClick={()=>setMode('color')} style={{background:mode==='color'?'#222':'#ff7a45', color:'white', padding:10, border:'none', borderRadius:10}}>2. Color</button>
          <button onClick={()=>setMode('hd')} style={{background:mode==='hd'?'#222':'#ff7a45', color:'white', padding:10, border:'none', borderRadius:10}}>3. HD</button>
        </div>
        <div style={{display:'flex', gap:10}}><div style={{flex:1}}>{orig && <img src={orig} style={{width:'100%'}}/>}</div><div style={{flex:1}}>{result && <img src={result} style={{width:'100%'}}/>}</div></div>
        <button onClick={procesar} style={{width:'100%', padding:14, background:'#111', color:'white', borderRadius:12, marginTop:12}}>{loading || 'Restaurar Potente'}</button>
        {result && <a href={result} download="restaurada.jpg" style={{display:'block', textAlign:'center', background:'#ff7a45', color:'white', padding:12, borderRadius:10, marginTop:10, textDecoration:'none'}}>Descargar</a>}
      </div>
    </div>
  )
}

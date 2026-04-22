// // import { useState, useRef, useCallback } from "react";
// // import './UploadPanel.css';
// // const PHASES = [
// //   "Preprocessing image…",
// //   "Extracting CNN features (8× TTA)…",
// //   "Running binary ensemble…",
// //   "Grading severity…",
// //   "Generating Grad-CAM…",
// //   "Running LIME analysis…",
// //   "Computing SHAP values…",
// //   "Writing clinical reports…",
// // ];

// // export default function UploadPanel({ onResult, onLoading }) {
// //   const [dragging, setDragging] = useState(false);
// //   const [preview,  setPreview]  = useState(null);
// //   const [file,     setFile]     = useState(null);
// //   const [error,    setError]    = useState(null);
// //   const [loading,  setLoading]  = useState(false);
// //   const [phase,    setPhase]    = useState(0);
// //   const inputRef = useRef();

// //   const validate = (f) => {
// //     setError(null);
// //     if (!["image/jpeg","image/png","image/jpg"].includes(f.type))
// //       return setError("Only JPEG or PNG images accepted.");
// //     if (f.size > 10 * 1024 * 1024)
// //       return setError("File exceeds 10 MB limit.");
// //     setFile(f); setPreview(URL.createObjectURL(f));
// //   };

// //   const onDrop      = useCallback((e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) validate(e.dataTransfer.files[0]); }, []);
// //   const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
// //   const onDragLeave = () => setDragging(false);
// //   const onInput     = (e) => { if (e.target.files[0]) validate(e.target.files[0]); };
// //   const reset       = () => { setFile(null); setPreview(null); setError(null); inputRef.current.value = ""; };

// //   const submit = async () => {
// //     if (!file) return;
// //     setLoading(true); setError(null); onLoading(true); setPhase(0);
// //     const timer = setInterval(() => setPhase(p => Math.min(p+1, PHASES.length-1)), 2400);
// //     try {
// //       const form = new FormData();
// //       form.append("file", file);
// //       const res  = await fetch("http://localhost:5000/api/predict", { method:"POST", body:form });
// //       const json = await res.json();
// //       if (!res.ok || !json.success) throw new Error(json.error || "Prediction failed.");
// //       onResult(json.data, preview);
// //     } catch (err) {
// //       setError(err.message); onLoading(false);
// //     } finally {
// //       clearInterval(timer); setLoading(false);
// //     }
// //   };

// //   return (
// //     <div style={s.root}>
// //       {/* Drop zone */}
// //       <div
// //         style={{ ...s.zone, ...(dragging ? s.drag : {}), ...(preview ? s.hasImg : {}) }}
// //         onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
// //         onClick={() => !preview && !loading && inputRef.current.click()}
// //       >
// //         {!preview ? (
// //           <div style={s.placeholder}>
// //             <div style={s.eyeWrap}>
// //               {dragging && <span style={s.ring} />}
// //               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
// //                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
// //               </svg>
// //             </div>
// //             <p style={s.ph1}>{dragging ? "Release to load" : "Drop fundus image here"}</p>
// //             <p style={s.ph2}>JPEG · PNG · max 10 MB</p>
// //             <button style={s.browse} onClick={e => { e.stopPropagation(); inputRef.current.click(); }}>Browse files</button>
// //           </div>
// //         ) : (
// //           <div style={s.prevWrap}>
// //             {!loading && <div style={s.scanline} />}
// //             <img src={preview} alt="preview" style={s.prevImg} />
// //             <div style={s.prevBar}>
// //               <span style={s.prevName}>{file.name}</span>
// //               {!loading && <button style={s.rmBtn} onClick={e => { e.stopPropagation(); reset(); }}>✕ Remove</button>}
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" style={{display:"none"}} onChange={onInput} />

// //       {error && (
// //         <div style={s.err}>
// //           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
// //           {error}
// //         </div>
// //       )}

// //       {loading && (
// //         <div style={s.loadBox}>
// //           <div style={s.spinner} />
// //           <div style={s.phaseWrap}>
// //             <p style={s.phaseText}>{PHASES[phase]}</p>
// //             <div style={s.phaseBg}><div style={{ ...s.phaseFill, width:`${((phase+1)/PHASES.length)*100}%` }} /></div>
// //           </div>
// //         </div>
// //       )}

// //       {preview && !loading && (
// //         <button style={s.analyseBtn} onClick={submit}>
// //           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
// //             <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
// //           </svg>
// //           Analyse Image
// //         </button>
// //       )}
// //     </div>
// //   );
// // }

// // const s = {
// //   root: { display:"flex", flexDirection:"column", gap:"12px" },
// //   zone: {
// //     border:"1.5px dashed var(--border-hi)", borderRadius:"var(--r-lg)",
// //     background:"var(--card)", minHeight:"190px",
// //     display:"flex", alignItems:"center", justifyContent:"center",
// //     cursor:"pointer", transition:"border-color .2s, background .2s, box-shadow .2s",
// //     overflow:"hidden", position:"relative",
// //   },
// //   drag: { borderColor:"var(--sage)", background:"var(--sage-glow)", boxShadow:"0 0 28px var(--sage-hi)" },
// //   hasImg: { minHeight:"240px", cursor:"default" },
// //   placeholder: { display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", padding:"36px 20px" },
// //   eyeWrap: {
// //     position:"relative", width:"54px", height:"54px", borderRadius:"50%",
// //     border:"1px solid var(--border-hi)", background:"var(--surface)",
// //     display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"4px",
// //   },
// //   ring: {
// //     position:"absolute", inset:0, borderRadius:"50%",
// //     border:"1.5px solid var(--sage)", animation:"ringpulse 1s ease-out infinite",
// //   },
// //   ph1: { fontFamily:"var(--sans)", fontWeight:500, fontSize:".88rem", color:"var(--text)" },
// //   ph2: { fontFamily:"var(--mono)", fontSize:".67rem", color:"var(--text-muted)", letterSpacing:".06em" },
// //   browse: {
// //     marginTop:"4px", padding:"6px 18px", borderRadius:"var(--r-sm)",
// //     border:"1px solid var(--border-hi)", background:"transparent",
// //     color:"var(--text-dim)", fontFamily:"var(--sans)", fontSize:".8rem", cursor:"pointer",
// //   },
// //   prevWrap: { position:"relative", width:"100%", height:"240px" },
// //   scanline: {
// //     position:"absolute", left:0, right:0, height:"2px", zIndex:3,
// //     background:"linear-gradient(90deg,transparent,var(--sage),transparent)",
// //     animation:"scanline 1.8s linear 1",
// //   },
// //   prevImg: { width:"100%", height:"100%", objectFit:"cover", display:"block" },
// //   prevBar: {
// //     position:"absolute", bottom:0, left:0, right:0, zIndex:2,
// //     padding:"8px 12px", background:"linear-gradient(transparent,rgba(7,17,31,.9))",
// //     display:"flex", alignItems:"center", justifyContent:"space-between",
// //   },
// //   prevName: { fontFamily:"var(--mono)", fontSize:".65rem", color:"var(--sage)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"180px" },
// //   rmBtn: { background:"transparent", border:"1px solid var(--border-hi)", borderRadius:"var(--r-sm)", color:"var(--text-muted)", fontFamily:"var(--sans)", fontSize:".72rem", padding:"3px 9px", cursor:"pointer" },
// //   err: {
// //     display:"flex", alignItems:"center", gap:"8px", padding:"9px 13px",
// //     borderRadius:"var(--r-sm)", background:"rgba(248,113,113,.07)",
// //     border:"1px solid rgba(248,113,113,.22)", color:"var(--rose)",
// //     fontFamily:"var(--mono)", fontSize:".74rem",
// //   },
// //   loadBox: {
// //     display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px",
// //     borderRadius:"var(--r-md)", background:"var(--card)", border:"1px solid var(--border)",
// //   },
// //   spinner: {
// //     width:"18px", height:"18px", flexShrink:0, borderRadius:"50%",
// //     border:"2px solid var(--border-hi)", borderTopColor:"var(--sage)",
// //     animation:"spin .75s linear infinite",
// //   },
// //   phaseWrap: { flex:1, display:"flex", flexDirection:"column", gap:"6px" },
// //   phaseText: { fontFamily:"var(--mono)", fontSize:".72rem", color:"var(--text-dim)", letterSpacing:".02em" },
// //   phaseBg: { height:"3px", borderRadius:"2px", background:"var(--border)", overflow:"hidden" },
// //   phaseFill: { height:"100%", borderRadius:"2px", background:"var(--sage)", transition:"width .5s ease" },
// //   analyseBtn: {
// //     display:"flex", alignItems:"center", justifyContent:"center",
// //     width:"100%", padding:"12px", borderRadius:"var(--r-md)", border:"none",
// //     background:"var(--sage)", color:"var(--bg)", fontFamily:"var(--sans)",
// //     fontWeight:700, fontSize:".85rem", cursor:"pointer",
// //     boxShadow:"0 4px 20px rgba(94,234,212,0.2)",
// //     transition:"opacity .15s, transform .1s",
// //   },
// // };
// import { useState, useRef, useCallback } from "react";

// const PHASES = [
//   "Preprocessing fundus image…",
//   "Extracting CNN features (×8 TTA)…",
//   "Running binary ensemble classifier…",
//   "Running cascade severity grading…",
//   "Generating Grad-CAM heatmap…",
//   "Running LIME superpixel analysis…",
//   "Computing SHAP attributions…",
//   "Composing AI clinical narrative…",
// ];

// export default function UploadPanel({ onResult, onLoading, token }) {
//   const [dragging, setDragging]   = useState(false);
//   const [preview,  setPreview]    = useState(null);
//   const [file,     setFile]       = useState(null);
//   const [error,    setError]      = useState(null);
//   const [loading,  setLoading]    = useState(false);
//   const [phase,    setPhase]      = useState(0);
//   const inputRef = useRef();

//   const validate = (f) => {
//     setError(null);
//     if (!["image/jpeg","image/png","image/jpg"].includes(f.type))
//       return setError("Only JPEG or PNG images accepted.");
//     if (f.size > 10 * 1024 * 1024)
//       return setError("File exceeds 10 MB limit.");
//     setFile(f);
//     setPreview(URL.createObjectURL(f));
//   };

//   const onDrop      = useCallback((e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) validate(e.dataTransfer.files[0]); }, []);
//   const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
//   const onDragLeave = () => setDragging(false);
//   const onInput     = (e) => { if (e.target.files[0]) validate(e.target.files[0]); };
//   const reset       = () => { setFile(null); setPreview(null); setError(null); inputRef.current.value = ""; };

//   const submit = async () => {
//     if (!file) return;
//     setLoading(true); setError(null); onLoading(true); setPhase(0);
//     const timer = setInterval(() => setPhase(p => Math.min(p + 1, PHASES.length - 1)), 2200);
//     try {
//       const form = new FormData();
//       form.append("file", file);
//       const headers = {};
//       if (token) headers["Authorization"] = `Bearer ${token}`;
//       const res  = await fetch("http://localhost:5000/api/predict", { method:"POST", body:form, headers });
//       const json = await res.json();
//       if (!res.ok || !json.success) throw new Error(json.error || "Prediction failed.");
//       onResult(json.data, preview);
//     } catch (err) {
//       setError(err.message);
//       onLoading(false);
//     } finally {
//       clearInterval(timer);
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={s.root}>
//       <div
//         style={{ ...s.zone, ...(dragging?s.zoneDrag:{}), ...(preview?s.zoneHasImg:{}) }}
//         onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
//         onClick={() => !preview && !loading && inputRef.current.click()}
//       >
//         {!preview ? (
//           <div style={s.placeholder}>
//             <div style={s.eyeRing}>
//               {dragging && <span style={s.pulseRing} />}
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
//                 stroke="var(--cyan)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//                 <circle cx="12" cy="12" r="3"/>
//               </svg>
//             </div>
//             <p style={s.placeholderTitle}>{dragging ? "Release to load" : "Drop fundus image"}</p>
//             <p style={s.placeholderSub}>JPEG · PNG · max 10 MB</p>
//             <button style={s.browseBtn} onClick={(e)=>{e.stopPropagation(); inputRef.current.click();}}>
//               Browse files
//             </button>
//           </div>
//         ) : (
//           <div style={s.previewBox}>
//             {!loading && <div style={s.scanline} />}
//             <img src={preview} alt="preview" style={s.previewImg} />
//             <div style={s.previewOverlay}>
//               <span style={s.previewName}>{file.name}</span>
//               {!loading && (
//                 <button style={s.removeBtn} onClick={(e)=>{e.stopPropagation(); reset();}}>✕</button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" style={{display:"none"}} onChange={onInput} />

//       {error && (
//         <div style={s.errorBox}>
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
//             <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
//           </svg>
//           {error}
//         </div>
//       )}

//       {loading && (
//         <div style={s.loadingBox}>
//           <div style={s.spinner} />
//           <div style={s.phaseBlock}>
//             <p style={s.phaseText}>{PHASES[phase]}</p>
//             <div style={s.phaseBar}>
//               <div style={{ ...s.phaseBarFill, width:`${((phase+1)/PHASES.length)*100}%` }} />
//             </div>
//           </div>
//         </div>
//       )}

//       {preview && !loading && (
//         <button style={s.analyseBtn} onClick={submit}>
//           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//             strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
//             <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
//           </svg>
//           Analyse Image
//         </button>
//       )}
//     </div>
//   );
// }

// const s = {
//   root: { display:"flex", flexDirection:"column", gap:"12px" },
//   zone: {
//     border:"1.5px dashed var(--border-hi)", borderRadius:"var(--r-lg)",
//     background:"var(--card)", minHeight:"200px",
//     display:"flex", alignItems:"center", justifyContent:"center",
//     cursor:"pointer", overflow:"hidden", position:"relative",
//     transition:"border-color .2s, box-shadow .2s, background .2s",
//   },
//   zoneDrag: {
//     borderColor:"var(--cyan)", background:"var(--cyan-glow)",
//     boxShadow:"0 0 30px var(--cyan-glow-hi)",
//   },
//   zoneHasImg: { minHeight:"260px", cursor:"default" },
//   placeholder: {
//     display:"flex", flexDirection:"column", alignItems:"center",
//     gap:"10px", padding:"40px 24px",
//   },
//   eyeRing: {
//     position:"relative", width:"56px", height:"56px", borderRadius:"50%",
//     border:"1.5px solid var(--border-hi)", background:"var(--surface)",
//     display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"6px",
//   },
//   pulseRing: {
//     position:"absolute", inset:0, borderRadius:"50%",
//     border:"1.5px solid var(--cyan)", animation:"pulsering 1s ease-out infinite",
//   },
//   placeholderTitle: {
//     fontFamily:"var(--font-display)", fontWeight:500,
//     fontSize:".88rem", color:"var(--text)", letterSpacing:"-.01em",
//   },
//   placeholderSub: {
//     fontFamily:"var(--font-mono)", fontSize:".7rem",
//     color:"var(--text-muted)", letterSpacing:".06em",
//   },
//   browseBtn: {
//     marginTop:"6px", padding:"6px 18px", borderRadius:"var(--r-sm)",
//     border:"1px solid var(--border-hi)", background:"transparent",
//     color:"var(--text-dim)", fontFamily:"var(--font-body)",
//     fontSize:".8rem", cursor:"pointer",
//   },
//   previewBox: { position:"relative", width:"100%", height:"260px" },
//   scanline: {
//     position:"absolute", left:0, right:0, height:"2px", zIndex:3,
//     background:"linear-gradient(90deg,transparent,var(--cyan),transparent)",
//     animation:"scanline 1.8s linear 1",
//   },
//   previewImg: { width:"100%", height:"100%", objectFit:"cover", display:"block" },
//   previewOverlay: {
//     position:"absolute", bottom:0, left:0, right:0, zIndex:2,
//     padding:"8px 12px",
//     background:"linear-gradient(transparent, rgba(13,11,21,.92))",
//     display:"flex", alignItems:"center", justifyContent:"space-between",
//   },
//   previewName: {
//     fontFamily:"var(--font-mono)", fontSize:".68rem", color:"var(--cyan)",
//     overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"200px",
//   },
//   removeBtn: {
//     background:"transparent", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-sm)", color:"var(--text-muted)",
//     fontFamily:"var(--font-body)", fontSize:".72rem",
//     padding:"3px 9px", cursor:"pointer",
//   },
//   errorBox: {
//     display:"flex", alignItems:"center", gap:"8px",
//     padding:"9px 13px", borderRadius:"var(--r-sm)",
//     background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.25)",
//     color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:".75rem",
//   },
//   loadingBox: {
//     display:"flex", alignItems:"center", gap:"12px",
//     padding:"13px 15px", borderRadius:"var(--r-md)",
//     background:"var(--card)", border:"1px solid var(--border)",
//   },
//   spinner: {
//     width:"18px", height:"18px", flexShrink:0, borderRadius:"50%",
//     border:"2px solid var(--border-hi)", borderTopColor:"var(--cyan)",
//     animation:"spin .75s linear infinite",
//   },
//   phaseBlock: { flex:1, display:"flex", flexDirection:"column", gap:"7px" },
//   phaseText: {
//     fontFamily:"var(--font-mono)", fontSize:".73rem",
//     color:"var(--text-dim)", letterSpacing:".02em",
//   },
//   phaseBar: { height:"3px", borderRadius:"2px", background:"var(--border)", overflow:"hidden" },
//   phaseBarFill: {
//     height:"100%", borderRadius:"2px", background:"var(--cyan)",
//     transition:"width .6s ease",
//   },
//   analyseBtn: {
//     display:"flex", alignItems:"center", justifyContent:"center",
//     width:"100%", padding:"13px", borderRadius:"var(--r-md)", border:"none",
//     background:"var(--cyan)", color:"var(--bg)",
//     fontFamily:"var(--font-display)", fontWeight:600,
//     fontSize:".82rem", letterSpacing:".04em", cursor:"pointer",
//     boxShadow:"0 4px 20px rgba(244,114,182,0.28)",
//   },
// };
import { useState, useRef, useCallback } from "react";
import API_URL from "../config";

const PHASES = [
  "Preprocessing fundus image…",
  "Extracting CNN features (×8 TTA)…",
  "Running binary ensemble classifier…",
  "Running cascade severity grading…",
  "Generating Grad-CAM heatmap…",
  "Running LIME superpixel analysis…",
  "Computing SHAP attributions…",
  "Composing AI clinical narrative…",
];

export default function UploadPanel({ onResult, onLoading, token }) {
  const [dragging, setDragging]   = useState(false);
  const [preview,  setPreview]    = useState(null);
  const [file,     setFile]       = useState(null);
  const [error,    setError]      = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [phase,    setPhase]      = useState(0);
  const inputRef = useRef();

  const validate = (f) => {
    setError(null);
    if (!["image/jpeg","image/png","image/jpg"].includes(f.type))
      return setError("Only JPEG or PNG images accepted.");
    if (f.size > 10 * 1024 * 1024)
      return setError("File exceeds 10 MB limit.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop      = useCallback((e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) validate(e.dataTransfer.files[0]); }, []);
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInput     = (e) => { if (e.target.files[0]) validate(e.target.files[0]); };
  const reset       = () => { setFile(null); setPreview(null); setError(null); inputRef.current.value = ""; };

  const submit = async () => {
    if (!file) return;
    setLoading(true); setError(null); onLoading(true); setPhase(0);
    const timer = setInterval(() => setPhase(p => Math.min(p + 1, PHASES.length - 1)), 2200);
    try {
      const form = new FormData();
      form.append("file", file);
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(`${API_URL}/api/predict`, { method:"POST", body:form, headers });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Prediction failed.");
      onResult(json.data, preview);
    } catch (err) {
      setError(err.message);
      onLoading(false);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div
        style={{ ...s.zone, ...(dragging?s.zoneDrag:{}), ...(preview?s.zoneHasImg:{}) }}
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => !preview && !loading && inputRef.current.click()}
      >
        {!preview ? (
          <div style={s.placeholder}>
            <div style={s.eyeRing}>
              {dragging && <span style={s.pulseRing} />}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="var(--cyan)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <p style={s.placeholderTitle}>{dragging ? "Release to load" : "Drop fundus image"}</p>
            <p style={s.placeholderSub}>JPEG · PNG · max 10 MB</p>
            <button style={s.browseBtn} onClick={(e)=>{e.stopPropagation(); inputRef.current.click();}}>
              Browse files
            </button>
          </div>
        ) : (
          <div style={s.previewBox}>
            {!loading && <div style={s.scanline} />}
            <img src={preview} alt="preview" style={s.previewImg} />
            <div style={s.previewOverlay}>
              <span style={s.previewName}>{file.name}</span>
              {!loading && (
                <button style={s.removeBtn} onClick={(e)=>{e.stopPropagation(); reset();}}>✕</button>
              )}
            </div>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" style={{display:"none"}} onChange={onInput} />

      {error && (
        <div style={s.errorBox}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {loading && (
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <div style={s.phaseBlock}>
            <p style={s.phaseText}>{PHASES[phase]}</p>
            <div style={s.phaseBar}>
              <div style={{ ...s.phaseBarFill, width:`${((phase+1)/PHASES.length)*100}%` }} />
            </div>
          </div>
        </div>
      )}

      {preview && !loading && (
        <button style={s.analyseBtn} onClick={submit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Analyse Image
        </button>
      )}
    </div>
  );
}

const s = {
  root: { display:"flex", flexDirection:"column", gap:"12px" },
  zone: {
    border:"1.5px dashed var(--border-hi)", borderRadius:"var(--r-lg)",
    background:"var(--card)", minHeight:"200px",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", overflow:"hidden", position:"relative",
    transition:"border-color .2s, box-shadow .2s, background .2s",
  },
  zoneDrag: {
    borderColor:"var(--cyan)", background:"var(--cyan-glow)",
    boxShadow:"0 0 30px var(--cyan-glow-hi)",
  },
  zoneHasImg: { minHeight:"260px", cursor:"default" },
  placeholder: {
    display:"flex", flexDirection:"column", alignItems:"center",
    gap:"10px", padding:"40px 24px",
  },
  eyeRing: {
    position:"relative", width:"56px", height:"56px", borderRadius:"50%",
    border:"1.5px solid var(--border-hi)", background:"var(--surface)",
    display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"6px",
  },
  pulseRing: {
    position:"absolute", inset:0, borderRadius:"50%",
    border:"1.5px solid var(--cyan)", animation:"pulsering 1s ease-out infinite",
  },
  placeholderTitle: {
    fontFamily:"var(--font-display)", fontWeight:500,
    fontSize:".88rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  placeholderSub: {
    fontFamily:"var(--font-mono)", fontSize:".7rem",
    color:"var(--text-muted)", letterSpacing:".06em",
  },
  browseBtn: {
    marginTop:"6px", padding:"6px 18px", borderRadius:"var(--r-sm)",
    border:"1px solid var(--border-hi)", background:"transparent",
    color:"var(--text-dim)", fontFamily:"var(--font-body)",
    fontSize:".8rem", cursor:"pointer",
  },
  previewBox: { position:"relative", width:"100%", height:"260px" },
  scanline: {
    position:"absolute", left:0, right:0, height:"2px", zIndex:3,
    background:"linear-gradient(90deg,transparent,var(--cyan),transparent)",
    animation:"scanline 1.8s linear 1",
  },
  previewImg: { width:"100%", height:"100%", objectFit:"cover", display:"block" },
  previewOverlay: {
    position:"absolute", bottom:0, left:0, right:0, zIndex:2,
    padding:"8px 12px",
    background:"linear-gradient(transparent, rgba(13,11,21,.92))",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  },
  previewName: {
    fontFamily:"var(--font-mono)", fontSize:".68rem", color:"var(--cyan)",
    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"200px",
  },
  removeBtn: {
    background:"transparent", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-sm)", color:"var(--text-muted)",
    fontFamily:"var(--font-body)", fontSize:".72rem",
    padding:"3px 9px", cursor:"pointer",
  },
  errorBox: {
    display:"flex", alignItems:"center", gap:"8px",
    padding:"9px 13px", borderRadius:"var(--r-sm)",
    background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.25)",
    color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:".75rem",
  },
  loadingBox: {
    display:"flex", alignItems:"center", gap:"12px",
    padding:"13px 15px", borderRadius:"var(--r-md)",
    background:"var(--card)", border:"1px solid var(--border)",
  },
  spinner: {
    width:"18px", height:"18px", flexShrink:0, borderRadius:"50%",
    border:"2px solid var(--border-hi)", borderTopColor:"var(--cyan)",
    animation:"spin .75s linear infinite",
  },
  phaseBlock: { flex:1, display:"flex", flexDirection:"column", gap:"7px" },
  phaseText: {
    fontFamily:"var(--font-mono)", fontSize:".73rem",
    color:"var(--text-dim)", letterSpacing:".02em",
  },
  phaseBar: { height:"3px", borderRadius:"2px", background:"var(--border)", overflow:"hidden" },
  phaseBarFill: {
    height:"100%", borderRadius:"2px", background:"var(--cyan)",
    transition:"width .6s ease",
  },
  analyseBtn: {
    display:"flex", alignItems:"center", justifyContent:"center",
    width:"100%", padding:"13px", borderRadius:"var(--r-md)", border:"none",
    background:"var(--cyan)", color:"var(--bg)",
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".82rem", letterSpacing:".04em", cursor:"pointer",
    boxShadow:"0 4px 20px rgba(244,114,182,0.28)",
  },
};
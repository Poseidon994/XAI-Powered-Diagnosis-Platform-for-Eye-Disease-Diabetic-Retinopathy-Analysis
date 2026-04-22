// import { useState } from "react";
// import './ExplainPanel.css';
// const TABS = [
//   { id:"gradcam", label:"Grad-CAM",  desc:"Activation heatmap from the final CNN layer" },
//   { id:"lime",    label:"LIME",      desc:"Superpixel regions supporting or opposing the prediction" },
//   { id:"shap",    label:"SHAP",      desc:"PCA feature attribution from KernelExplainer" },
// ];

// export default function ExplainPanel({ originalSrc, gradcam, lime, shap }) {
//   const [tab,     setTab]     = useState("gradcam");
//   const [opacity, setOpacity] = useState(0.55);

//   const imgs = { gradcam, lime, shap };
//   const cur  = imgs[tab];
//   const info = TABS.find(t => t.id === tab);

//   return (
//     <div style={s.card}>
//       {/* Header */}
//       <div style={s.header}>
//         <div>
//           <p style={s.title}>Explainability</p>
//           <p style={s.desc}>{info.desc}</p>
//         </div>
//         <div style={s.tabs}>
//           {TABS.map(t => (
//             <button key={t.id}
//               style={{ ...s.tab, ...(tab === t.id ? s.tabOn : {}) }}
//               onClick={() => setTab(t.id)}
//             >
//               {t.label}
//               {!imgs[t.id] && <span style={s.unavail}>·</span>}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Image area */}
//       <div style={s.imgArea}>
//         {tab === "gradcam" ? (
//           <div style={s.splitGrid}>
//             {[
//               { src: originalSrc, label:"ORIGINAL" },
//               { src: gradcam ? `data:image/png;base64,${gradcam}` : null, label:"GRAD-CAM", overlay:true },
//             ].map(({ src, label, overlay }) => (
//               <div key={label} style={s.cell}>
//                 {src
//                   ? <img src={src} alt={label} style={s.cellImg} />
//                   : <Unavail label="Heatmap unavailable" />
//                 }
//                 <span style={s.cellTag}>{label}</span>
//               </div>
//             ))}
//           </div>
//         ) : (
//           cur
//             ? <img src={`data:image/png;base64,${cur}`} alt={tab} style={s.wideImg} />
//             : <Unavail label={`${info.label} unavailable`} />
//         )}
//       </div>

//       {/* Opacity slider for Grad-CAM */}
//       {tab === "gradcam" && gradcam && (
//         <div style={s.sliderRow}>
//           <span style={s.sliderLabel}>Heatmap intensity</span>
//           <input type="range" min={0} max={1} step={0.05} value={opacity}
//             onChange={e => setOpacity(parseFloat(e.target.value))}
//             style={s.slider}
//           />
//           <span style={s.sliderVal}>{Math.round(opacity*100)}%</span>
//         </div>
//       )}

//       {/* Legend */}
//       {tab === "gradcam" && (
//         <div style={s.legend}>
//           {[["#0000ff","Low"],["#00ff00","Medium"],["#ffff00","High"],["#ff0000","Critical"]].map(([c,l])=>(
//             <div key={l} style={s.legendItem}>
//               <div style={{ ...s.dot, background:c }} />
//               <span style={s.dotLabel}>{l}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function Unavail({ label }) {
//   return (
//     <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
//                   gap:"10px", padding:"50px 20px", color:"var(--text-muted)",
//                   fontFamily:"var(--mono)", fontSize:".75rem" }}>
//       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--border-hi)" strokeWidth="1.5">
//         <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
//       </svg>
//       {label}
//     </div>
//   );
// }

// const s = {
//   card: {
//     background:"var(--card)", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)", overflow:"hidden",
//     boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
//     animation:"fadeUp .5s .1s cubic-bezier(.16,1,.3,1) both",
//   },
//   header: {
//     padding:"16px 20px", display:"flex",
//     justifyContent:"space-between", alignItems:"flex-start",
//     flexWrap:"wrap", gap:"12px",
//     borderBottom:"1px solid var(--border)",
//   },
//   title: { fontFamily:"var(--sans)", fontWeight:600, fontSize:".9rem", color:"var(--text)" },
//   desc:  { fontFamily:"var(--sans)", fontSize:".75rem", color:"var(--text-muted)", marginTop:"3px" },
//   tabs:  { display:"flex", gap:"4px", background:"var(--surface)", borderRadius:"var(--r-md)", padding:"4px" },
//   tab:   {
//     padding:"5px 14px", borderRadius:"var(--r-sm)", border:"none",
//     background:"transparent", color:"var(--text-muted)",
//     fontFamily:"var(--sans)", fontSize:".78rem", cursor:"pointer",
//     transition:"background .15s, color .15s",
//   },
//   tabOn: { background:"var(--card)", color:"var(--sage)", boxShadow:"0 1px 4px rgba(0,0,0,.3)" },
//   unavail: { marginLeft:"4px", color:"var(--text-muted)", fontSize:".6rem" },

//   imgArea: { background:"var(--surface)", borderBottom:"1px solid var(--border)", minHeight:"200px", overflow:"hidden" },
//   splitGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"var(--border)" },
//   cell: { position:"relative", background:"#000", aspectRatio:"1" },
//   cellImg: { width:"100%", height:"100%", objectFit:"cover", display:"block" },
//   cellTag: {
//     position:"absolute", top:"8px", left:"10px",
//     fontFamily:"var(--mono)", fontSize:".58rem", color:"rgba(255,255,255,.65)",
//     letterSpacing:".1em", background:"rgba(0,0,0,.55)",
//     padding:"2px 8px", borderRadius:"3px",
//   },
//   wideImg: { width:"100%", display:"block", maxHeight:"380px", objectFit:"contain", background:"#000" },

//   sliderRow: {
//     display:"flex", alignItems:"center", gap:"12px",
//     padding:"10px 18px", borderBottom:"1px solid var(--border)",
//   },
//   sliderLabel: { fontFamily:"var(--mono)", fontSize:".68rem", color:"var(--text-muted)", flexShrink:0 },
//   slider: { flex:1, accentColor:"var(--sage)", cursor:"pointer" },
//   sliderVal: { fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--sage)", width:"34px", textAlign:"right" },

//   legend: { display:"flex", gap:"18px", padding:"10px 18px", flexWrap:"wrap" },
//   legendItem: { display:"flex", alignItems:"center", gap:"6px" },
//   dot: { width:"9px", height:"9px", borderRadius:"50%", flexShrink:0 },
//   dotLabel: { fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--text-muted)" },
// };
import { useState } from "react";

const TABS = [
  { id:"gradcam", label:"Grad-CAM", desc:"Last convolutional layer activation weighted by class gradient" },
  { id:"lime",    label:"LIME",     desc:"Superpixel perturbation — regions supporting or opposing the prediction" },
  { id:"shap",    label:"SHAP",     desc:"KernelExplainer attribution of PCA feature contributions to ensemble output" },
];

export default function ExplainPanel({ originalSrc, gradcam, lime, shap }) {
  const [active,  setActive]  = useState("gradcam");
  const [opacity, setOpacity] = useState(0.55);

  const imgs   = { gradcam, lime, shap };
  const curTab = TABS.find(t => t.id === active);
  const curImg = imgs[active];

  return (
    <div style={s.card} className="fadeUp-1">

      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.title}>Explainability Analysis</p>
          <p style={s.sub}>{curTab.desc}</p>
        </div>
        <div style={s.tabs}>
          {TABS.map(t => (
            <button key={t.id}
              style={{ ...s.tab, ...(active === t.id ? s.tabActive : {}) }}
              onClick={() => setActive(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image area */}
      <div style={s.imgArea}>
        {active === "gradcam" && (
          <div style={s.splitGrid}>
            <Cell src={originalSrc} label="ORIGINAL" />
            <Cell
              src={gradcam ? originalSrc : null}
              overlay={gradcam ? `data:image/png;base64,${gradcam}` : null}
              overlayOpacity={opacity}
              label="GRAD-CAM OVERLAY"
              fallback="Grad-CAM unavailable"
            />
          </div>
        )}
        {active === "lime" && (
          curImg
            ? <img src={`data:image/png;base64,${curImg}`} alt="LIME" style={s.wideImg} />
            : <NoData label="LIME unavailable" />
        )}
        {active === "shap" && (
          curImg
            ? <img src={`data:image/png;base64,${curImg}`} alt="SHAP" style={s.wideImg} />
            : <NoData label="SHAP unavailable" />
        )}
      </div>

      {/* Opacity slider for GradCAM */}
      {active === "gradcam" && gradcam && (
        <div style={s.controls}>
          <span style={s.ctrlLabel}>Overlay opacity</span>
          <input type="range" min={0} max={1} step={0.05} value={opacity}
            onChange={e => setOpacity(parseFloat(e.target.value))}
            style={s.slider} />
          <span style={s.ctrlVal}>{Math.round(opacity*100)}%</span>
        </div>
      )}

      {/* GradCAM legend */}
      {active === "gradcam" && (
        <div style={s.legend}>
          {[["#3b82f6","Low"],["#22c55e","Medium"],["#eab308","High"],["#ef4444","Critical"]].map(([c,l])=>(
            <div key={l} style={s.legendItem}>
              <div style={{ ...s.legendDot, background:c }} />
              <span style={s.legendLabel}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Cell({ src, overlay, overlayOpacity, label, fallback }) {
  return (
    <div style={c.cell}>
      {src
        ? <>
            <img src={src} alt={label} style={c.img} />
            {overlay && (
              <img src={overlay} alt="overlay" style={{
                ...c.img, position:"absolute", inset:0,
                opacity:overlayOpacity, mixBlendMode:"screen",
              }} />
            )}
          </>
        : <NoData label={fallback || "Unavailable"} />
      }
      <span style={c.tag}>{label}</span>
    </div>
  );
}

function NoData({ label }) {
  return (
    <div style={nd.wrap}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="var(--border-hi)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p style={nd.label}>{label}</p>
    </div>
  );
}

const s = {
  card: {
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", overflow:"hidden",
    boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
  },
  header: {
    padding:"18px 22px",
    display:"flex", justifyContent:"space-between",
    alignItems:"flex-start", flexWrap:"wrap", gap:"12px",
    borderBottom:"1px solid var(--border)",
  },
  title: {
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".88rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  sub: {
    fontFamily:"var(--font-body)", fontSize:".74rem",
    color:"var(--text-muted)", marginTop:"4px", maxWidth:"320px", lineHeight:1.4,
  },
  tabs: {
    display:"flex", gap:"4px",
    background:"var(--surface)", borderRadius:"var(--r-md)", padding:"4px",
  },
  tab: {
    padding:"6px 14px", borderRadius:"var(--r-sm)", border:"none",
    background:"transparent", color:"var(--text-muted)",
    fontFamily:"var(--font-body)", fontSize:".78rem",
    cursor:"pointer", transition:"background .15s, color .15s",
  },
  tabActive: {
    background:"var(--card)", color:"var(--cyan)",
    boxShadow:"0 1px 6px rgba(0,0,0,0.3)",
  },
  imgArea: {
    background:"var(--surface)", borderBottom:"1px solid var(--border)",
    minHeight:"220px", overflow:"hidden",
  },
  splitGrid: {
    display:"grid", gridTemplateColumns:"1fr 1fr",
    gap:"1px", background:"var(--border)",
  },
  wideImg: {
    width:"100%", display:"block",
    maxHeight:"420px", objectFit:"contain", background:"#000",
  },
  controls: {
    display:"flex", alignItems:"center", gap:"12px",
    padding:"10px 20px", borderBottom:"1px solid var(--border)",
    background:"var(--card)",
  },
  ctrlLabel: {
    fontFamily:"var(--font-mono)", fontSize:".7rem",
    color:"var(--text-muted)", flexShrink:0,
  },
  slider: { flex:1, accentColor:"var(--cyan)", cursor:"pointer" },
  ctrlVal: {
    fontFamily:"var(--font-mono)", fontSize:".72rem",
    color:"var(--cyan)", width:"36px", textAlign:"right",
  },
  legend: {
    display:"flex", gap:"20px", padding:"12px 20px", flexWrap:"wrap",
  },
  legendItem: { display:"flex", alignItems:"center", gap:"7px" },
  legendDot:  { width:"10px", height:"10px", borderRadius:"50%", flexShrink:0 },
  legendLabel: {
    fontFamily:"var(--font-mono)", fontSize:".65rem", color:"var(--text-muted)",
  },
};

const c = {
  cell: {
    position:"relative", background:"#000", aspectRatio:"1",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  img: {
    width:"100%", height:"100%", objectFit:"cover", display:"block",
  },
  tag: {
    position:"absolute", top:"8px", left:"10px",
    fontFamily:"var(--font-mono)", fontSize:".6rem",
    color:"rgba(255,255,255,0.65)", letterSpacing:".1em",
    background:"rgba(0,0,0,.55)", padding:"2px 8px", borderRadius:"3px",
  },
};

const nd = {
  wrap: {
    display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", gap:"10px",
    padding:"60px 20px", minHeight:"200px",
  },
  label: {
    fontFamily:"var(--font-mono)", fontSize:".78rem", color:"var(--text-muted)",
  },
};
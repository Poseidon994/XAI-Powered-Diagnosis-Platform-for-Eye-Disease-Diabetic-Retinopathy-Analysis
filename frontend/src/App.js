// import { useState } from "react";
// import "./index.css";
// import UploadPanel  from "./components/UploadPanel";
// import ResultCard   from "./components/ResultCard";
// import ExplainPanel from "./components/ExplainPanel";
// import ReportPanel  from "./components/ReportPanel";

// const PIPELINE = [
//   ["Preprocessing",  "Circular crop · Green channel boost · CLAHE"],
//   ["Backbones",      "ResNet-18 · GoogLeNet · EfficientNet-B4 · DenseNet-121 · ConvNeXt-Tiny"],
//   ["Ensemble",       "SVM + Random Forest + XGBoost with Youden-J threshold"],
//   ["Severity",       "Cascade SVM — NDR → MDR / PDR grading"],
//   ["Explainability", "Grad-CAM · LIME superpixel · SHAP feature attribution"],
//   ["AI Reports",     "Groq LLaMA-3 — clinical and patient-friendly narratives"],
// ];

// export default function App() {
//   const [result,   setResult]   = useState(null);
//   const [preview,  setPreview]  = useState(null);
//   const [loading,  setLoading]  = useState(false);
//   const [mainTab,  setMainTab]  = useState("analysis");  // "analysis" | "report"

//   const handleResult = (data, prev) => {
//     setResult(data); setPreview(prev); setLoading(false);
//     setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior:"smooth" }), 100);
//   };

//   const reset = () => { setResult(null); setPreview(null); setLoading(false); setMainTab("analysis"); };

//   return (
//     <div style={s.root}>

//       {/* ── Header ───────────────────────────────────────────────── */}
//       <header style={s.header}>
//         <div style={s.headerInner}>
//           <div style={s.logo}>
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//               <circle cx="12" cy="12" r="3"/>
//             </svg>
//             <span style={s.logoText}>Ocula<span style={s.logoDim}> DR</span></span>
//           </div>
//           <div style={s.headerRight}>
//             <span style={s.badge}>98.50% Binary</span>
//             <span style={s.badge}>90.68% Multiclass</span>
//             <span style={s.badge}>5 CNN Backbones</span>
//           </div>
//         </div>
//       </header>

//       {/* ── Hero ─────────────────────────────────────────────────── */}
//       <section style={s.hero}>
//         <p style={s.eyebrow}>Automated Fundus Analysis · XAI-Powered</p>
//         <h1 style={s.heroTitle}>
//           Diabetic Retinopathy
//           <br />
//           <em style={s.heroItalic}>Screening & Grading</em>
//         </h1>
//         <p style={s.heroSub}>
//           Upload a fundus photograph to receive automated DR classification,
//           severity grading, explainability maps, and AI-generated clinical reports.
//         </p>
//       </section>

//       {/* ── Main Layout ──────────────────────────────────────────── */}
//       <main style={s.main}>

//         {/* Left: upload + pipeline info */}
//         <aside style={s.aside}>
//           <div style={s.panel}>
//             <div style={s.panelHead}>
//               <div style={s.panelDot} />
//               <p style={s.panelTitle}>Upload Image</p>
//             </div>
//             <UploadPanel onResult={handleResult} onLoading={setLoading} />
//           </div>

//           <div style={s.infoPanel}>
//             <p style={s.infoHeading}>Analysis Pipeline</p>
//             {PIPELINE.map(([k, v]) => (
//               <div key={k} style={s.pipeRow}>
//                 <p style={s.pipeKey}>{k}</p>
//                 <p style={s.pipeVal}>{v}</p>
//               </div>
//             ))}
//           </div>
//         </aside>

//         {/* Right: results */}
//         <section id="results" style={s.right}>

//           {/* Empty state */}
//           {!result && !loading && (
//             <div style={s.empty}>
//               <RetinalSVG />
//               <p style={s.emptyTitle}>Ready to analyse</p>
//               <p style={s.emptySub}>Upload a fundus photograph to begin.</p>
//             </div>
//           )}

//           {/* Loading */}
//           {loading && (
//             <div style={s.loadState}>
//               <div style={s.bigSpin} />
//               <p style={s.loadTitle}>Analysing image…</p>
//               <p style={s.loadSub}>Running full 5-backbone XAI pipeline</p>
//             </div>
//           )}

//           {/* Results */}
//           {result && !loading && (
//             <div style={s.resultsWrap}>
//               {/* Top bar: status + tab switcher + new image */}
//               <div style={s.resultsBar}>
//                 <div style={s.statusPill}>
//                   <div style={s.statusDot} />
//                   Analysis complete
//                 </div>

//                 {/* Main tab switcher */}
//                 <div style={s.mainTabs}>
//                   <button
//                     style={{ ...s.mainTab, ...(mainTab==="analysis" ? s.mainTabOn : {}) }}
//                     onClick={() => setMainTab("analysis")}
//                   >
//                     Results
//                   </button>
//                   <button
//                     style={{ ...s.mainTab, ...(mainTab==="report" ? { ...s.mainTabOn, color:"var(--iris)" } : {}) }}
//                     onClick={() => setMainTab("report")}
//                   >
//                     AI Report
//                     {(result.clinical_report || result.patient_report) && (
//                       <span style={s.newDot} />
//                     )}
//                   </button>
//                 </div>

//                 <button style={s.newBtn} onClick={reset}>← New image</button>
//               </div>

//               {/* Analysis tab */}
//               {mainTab === "analysis" && (
//                 <div style={s.stack}>
//                   <ResultCard result={result} />
//                   <ExplainPanel
//                     originalSrc={preview}
//                     gradcam={result.gradcam_base64}
//                     lime={result.lime_base64}
//                     shap={result.shap_base64}
//                   />
//                 </div>
//               )}

//               {/* Report tab */}
//               {mainTab === "report" && (
//                 <ReportPanel result={result} />
//               )}
//             </div>
//           )}
//         </section>
//       </main>

//       {/* ── Footer ───────────────────────────────────────────────── */}
//       <footer style={s.footer}>
//         <span>Ocula DR Screening System</span>
//         <span style={{color:"var(--text-muted)"}}>For research use only · Not a certified medical device</span>
//       </footer>
//     </div>
//   );
// }

// function RetinalSVG() {
//   return (
//     <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
//       stroke="var(--border-hi)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//       <circle cx="12" cy="12" r="3"/>
//       <line x1="12" y1="2" x2="12" y2="5"/>
//       <line x1="12" y1="19" x2="12" y2="22"/>
//       <line x1="2" y1="12" x2="5" y2="12"/>
//       <line x1="19" y1="12" x2="22" y2="12"/>
//     </svg>
//   );
// }

// const s = {
//   root: { minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative" },

//   header: {
//     borderBottom:"1px solid var(--border)", background:"rgba(7,17,31,.9)",
//     backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100,
//   },
//   headerInner: {
//     maxWidth:"1280px", margin:"0 auto", padding:"0 28px", height:"58px",
//     display:"flex", alignItems:"center", justifyContent:"space-between",
//   },
//   logo: { display:"flex", alignItems:"center", gap:"10px" },
//   logoText: { fontFamily:"var(--sans)", fontWeight:700, fontSize:"1.15rem", color:"var(--text)" },
//   logoDim:  { color:"var(--sage)", fontWeight:300 },
//   headerRight: { display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"flex-end" },
//   badge: {
//     fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--text-muted)",
//     padding:"3px 9px", borderRadius:"20px",
//     border:"1px solid var(--border)", background:"var(--surface)",
//     letterSpacing:".04em",
//   },

//   hero: {
//     maxWidth:"1280px", margin:"0 auto",
//     padding:"54px 28px 40px", textAlign:"center",
//     position:"relative", zIndex:1,
//   },
//   eyebrow: {
//     fontFamily:"var(--mono)", fontSize:".68rem",
//     letterSpacing:".18em", color:"var(--sage)",
//     textTransform:"uppercase", marginBottom:"14px",
//   },
//   heroTitle: {
//     fontFamily:"var(--serif)",
//     fontSize:"clamp(1.9rem,4.5vw,2.9rem)",
//     color:"var(--text)", lineHeight:1.15,
//     fontWeight:400, marginBottom:"16px",
//   },
//   heroItalic: {
//     fontStyle:"italic",
//     background:"linear-gradient(135deg, var(--sage) 0%, var(--iris) 100%)",
//     WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
//   },
//   heroSub: {
//     fontFamily:"var(--sans)", fontSize:".95rem",
//     color:"var(--text-dim)", lineHeight:1.75,
//     maxWidth:"560px", margin:"0 auto",
//   },

//   main: {
//     flex:1, maxWidth:"1280px", margin:"0 auto", width:"100%",
//     padding:"0 28px 72px",
//     display:"grid", gridTemplateColumns:"320px 1fr",
//     gap:"24px", alignItems:"start",
//     position:"relative", zIndex:1,
//   },
//   aside: { display:"flex", flexDirection:"column", gap:"16px", position:"sticky", top:"74px" },

//   panel: {
//     background:"var(--card)", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)", padding:"18px",
//     display:"flex", flexDirection:"column", gap:"14px",
//     boxShadow:"0 8px 28px rgba(0,0,0,0.3)",
//   },
//   panelHead: { display:"flex", alignItems:"center", gap:"8px" },
//   panelDot: {
//     width:"6px", height:"6px", borderRadius:"50%",
//     background:"var(--sage)", boxShadow:"0 0 8px var(--sage)",
//     animation:"softpulse 2.5s ease infinite",
//   },
//   panelTitle: { fontFamily:"var(--sans)", fontWeight:600, fontSize:".84rem", color:"var(--text)" },

//   infoPanel: {
//     background:"var(--card)", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)", padding:"16px 18px",
//     display:"flex", flexDirection:"column", gap:"12px",
//     boxShadow:"0 8px 28px rgba(0,0,0,0.3)",
//   },
//   infoHeading: { fontFamily:"var(--mono)", fontSize:".58rem", letterSpacing:".14em", color:"var(--text-muted)" },
//   pipeRow: {
//     display:"flex", flexDirection:"column", gap:"3px",
//     paddingBottom:"10px", borderBottom:"1px solid var(--border)",
//   },
//   pipeKey: { fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--sage-dim)", letterSpacing:".05em" },
//   pipeVal: { fontFamily:"var(--sans)", fontSize:".76rem", color:"var(--text-dim)", lineHeight:1.5 },

//   right: { display:"flex", flexDirection:"column", minHeight:"440px" },

//   empty: {
//     flex:1, display:"flex", flexDirection:"column", alignItems:"center",
//     justifyContent:"center", gap:"14px", minHeight:"440px",
//     border:"1.5px dashed var(--border)", borderRadius:"var(--r-xl)",
//   },
//   emptyTitle: { fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--text-dim)", fontStyle:"italic" },
//   emptySub:   { fontFamily:"var(--sans)", fontSize:".82rem", color:"var(--text-muted)" },

//   loadState: {
//     flex:1, display:"flex", flexDirection:"column", alignItems:"center",
//     justifyContent:"center", gap:"18px", minHeight:"440px",
//   },
//   bigSpin: {
//     width:"44px", height:"44px", borderRadius:"50%",
//     border:"3px solid var(--border-hi)", borderTopColor:"var(--sage)",
//     animation:"spin .9s linear infinite",
//     boxShadow:"0 0 20px rgba(94,234,212,0.15)",
//   },
//   loadTitle: { fontFamily:"var(--serif)", fontSize:"1.05rem", color:"var(--text)", fontStyle:"italic" },
//   loadSub:   { fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--text-muted)", letterSpacing:".04em" },

//   resultsWrap: { display:"flex", flexDirection:"column", gap:"14px" },
//   resultsBar: {
//     display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap",
//   },
//   statusPill: {
//     display:"flex", alignItems:"center", gap:"7px",
//     fontFamily:"var(--mono)", fontSize:".68rem", color:"var(--green)",
//     letterSpacing:".06em",
//   },
//   statusDot: {
//     width:"7px", height:"7px", borderRadius:"50%",
//     background:"var(--green)", boxShadow:"0 0 8px var(--green)",
//   },

//   mainTabs: {
//     display:"flex", background:"var(--surface)",
//     borderRadius:"var(--r-md)", padding:"4px", gap:"4px",
//   },
//   mainTab: {
//     position:"relative", display:"flex", alignItems:"center", gap:"6px",
//     padding:"6px 18px", borderRadius:"var(--r-sm)", border:"none",
//     background:"transparent", color:"var(--text-muted)",
//     fontFamily:"var(--sans)", fontSize:".82rem", fontWeight:500,
//     cursor:"pointer", transition:"all .15s",
//   },
//   mainTabOn: {
//     background:"var(--card)", color:"var(--sage)",
//     boxShadow:"0 1px 6px rgba(0,0,0,.35)",
//   },
//   newDot: {
//     width:"6px", height:"6px", borderRadius:"50%",
//     background:"var(--sage)", boxShadow:"0 0 6px var(--sage)",
//   },
//   newBtn: {
//     marginLeft:"auto", background:"transparent",
//     border:"1px solid var(--border-hi)", borderRadius:"var(--r-sm)",
//     color:"var(--text-muted)", fontFamily:"var(--sans)", fontSize:".78rem",
//     padding:"5px 13px", cursor:"pointer",
//   },

//   stack: { display:"flex", flexDirection:"column", gap:"14px" },

//   footer: {
//     borderTop:"1px solid var(--border)", padding:"14px 28px",
//     display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px",
//     fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--text-dim)",
//     letterSpacing:".04em", position:"relative", zIndex:1,
//   },
// };
import { useState, useEffect } from "react";
import "./index.css";
import LoginPage      from "./pages/LoginPage";
import Dashboard      from "./pages/Dashboard";
import UploadPanel    from "./components/UploadPanel";
import ResultCard     from "./components/ResultCard";
import ExplainPanel   from "./components/ExplainPanel";
import AIExplanation  from "./components/AIExplanation";
import ReportDownload from "./components/ReportDownload";
import RotatingFact   from "./components/RotatingFact";

function getStoredAuth() {
  try {
    const token = localStorage.getItem("ocula_token");
    const user  = JSON.parse(localStorage.getItem("ocula_user") || "null");
    return token && user ? { token, user } : null;
  } catch { return null; }
}
function clearAuth() {
  localStorage.removeItem("ocula_token");
  localStorage.removeItem("ocula_user");
}

const PIPELINE = [
  ["Input",     "Circular crop · Green boost · CLAHE"],
  ["Backbones", "ResNet-18 · GoogLeNet · EffNet-B4 · DenseNet · ConvNeXt"],
  ["Ensemble",  "SVM + RF + XGBoost (soft vote, Youden-J)"],
  ["Grading",   "Cascade SVM: NDR → MDR / PDR"],
  ["XAI",       "Grad-CAM · LIME · SHAP · Groq LLaMA-3"],
];

export default function App() {
  const [page,    setPage]    = useState("login");
  const [auth,    setAuth]    = useState(null);
  const [result,  setResult]  = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) { setAuth(stored); setPage("dashboard"); }
  }, []);

  const handleAuth = (user, token) => { setAuth({ user, token }); setPage("dashboard"); };
  const handleLogout = () => { clearAuth(); setAuth(null); setResult(null); setPreview(null); setPage("login"); };
  const handleResult = (data, prev) => {
    setResult(data); setPreview(prev); setLoading(false);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior:"smooth" }), 120);
  };
  const resetScan = () => { setResult(null); setPreview(null); setLoading(false); };

  if (page === "login")     return <LoginPage onAuth={handleAuth} />;
  if (page === "dashboard") return (
    <Dashboard
      user={auth.user} token={auth.token}
      onNewScan={() => { resetScan(); setPage("scan"); }}
      onLogout={handleLogout}
    />
  );

  const role = auth?.user?.role || "patient";

  /* ── Scan page ────────────────────────────────────────────────── */
  return (
    <div style={s.root}>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoDot} />
            <span style={s.logoText}>OCU<span style={s.logoAccent}>LA</span></span>
          </div>
          <div style={s.headerNav}>
            {auth && <>
              <button style={s.navBtn} onClick={() => setPage("dashboard")}>← Dashboard</button>
              <span style={s.navUser}>{auth.user.name}</span>
              <span style={s.navRole}>{role}</span>
            </>}
            {!auth && <button style={s.navBtn} onClick={() => setPage("login")}>Sign In</button>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={s.hero} className="z1">
        <p style={s.eyebrow}>Automated Fundus Analysis · XAI-Powered</p>
        <h1 style={s.heroTitle}>
          Diabetic Retinopathy<br />
          <span style={s.heroGrad}>Screening & Grading</span>
        </h1>
        <p style={s.heroSub}>
          Upload a fundus photograph to receive automated DR classification,
          severity grading, explainability maps, and an AI-generated{" "}
          {role === "clinician" ? "clinical" : "patient-friendly"} report.
        </p>
        <div style={s.factRow}>
          <RotatingFact />
        </div>
      </section>

      {/* Two-col main */}
      <main style={s.main} className="z1">

        {/* Left aside */}
        <aside style={s.aside}>
          <div style={s.panel}>
            <div style={s.panelHead}>
              <span style={s.panelDot} />
              <p style={s.panelTitle}>Upload Fundus Image</p>
            </div>
            <UploadPanel onResult={handleResult} onLoading={setLoading} token={auth?.token} />
          </div>

          <div style={s.panel}>
            <p style={s.infoHead}>Analysis Pipeline</p>
            {PIPELINE.map(([k,v]) => (
              <div key={k} style={s.pipeRow}>
                <span style={s.pipeKey}>{k}</span>
                <span style={s.pipeVal}>{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Results */}
        <section id="results" style={s.resultsArea}>
          {!result && !loading && <EmptyState />}
          {loading && <LoadingState />}
          {result && !loading && (
            <div style={s.stack}>
              <div style={s.stackHead}>
                <div style={s.statusRow}>
                  <span style={s.statusDot} />
                  <span style={s.statusText}>Analysis complete</span>
                  {auth && <span style={s.savedChip}>✓ Saved to history</span>}
                </div>
                <button style={s.newBtn} onClick={resetScan}>← New image</button>
              </div>

              <ResultCard result={result} />

              <ExplainPanel
                originalSrc={preview}
                gradcam={result.gradcam_base64}
                lime={result.lime_base64}
                shap={result.shap_base64}
              />

              {(result.ai_explanation || result.ai_explanation_patient) && (
                <AIExplanation result={result} role={role} />
              )}

              <ReportDownload result={result} role={role} />
            </div>
          )}
        </section>
      </main>

      <footer style={s.footer} className="z1">
        <span>OCULA · IEEE Techcon 2026 · See clearly. Act early.</span>
        <span style={{color:"var(--text-muted)"}}>Research use only · Not a certified medical device</span>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={e.wrap}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
        stroke="var(--border-hi)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
      </svg>
      <p style={e.title}>Awaiting Image</p>
      <p style={e.sub}>Upload a fundus photograph to begin DR analysis.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={e.wrap}>
      <div style={e.spinner} />
      <p style={e.title}>Analysing…</p>
      <p style={e.sub}>Running 5-backbone ensemble + XAI pipeline</p>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */
const s = {
  root: { minHeight:"100vh", display:"flex", flexDirection:"column" },

  header: {
    borderBottom:"1px solid var(--border)",
    background:"rgba(13,11,21,.9)", backdropFilter:"blur(14px)",
    position:"sticky", top:0, zIndex:100,
  },
  headerInner: {
    maxWidth:"1280px", margin:"0 auto",
    padding:"0 28px", height:"60px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  },
  logo: { display:"flex", alignItems:"center", gap:"10px" },
  logoDot: {
    width:"7px", height:"7px", borderRadius:"50%",
    background:"var(--cyan)", boxShadow:"0 0 8px var(--cyan)",
    animation:"blink 2.8s ease infinite",
  },
  logoText: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"1.1rem", color:"var(--text)", letterSpacing:".06em",
  },
  logoAccent: { color:"var(--cyan)" },
  headerNav: { display:"flex", alignItems:"center", gap:"12px" },
  navBtn: {
    padding:"6px 14px", borderRadius:"var(--r-sm)",
    border:"1px solid var(--border-hi)",
    background:"transparent", color:"var(--text-dim)",
    fontFamily:"var(--font-body)", fontSize:".78rem", cursor:"pointer",
  },
  navUser: { fontFamily:"var(--font-body)", fontSize:".82rem", color:"var(--text-dim)" },
  navRole: {
    fontFamily:"var(--font-mono)", fontSize:".62rem",
    padding:"2px 8px", borderRadius:"3px",
    border:"1px solid var(--border)", background:"var(--surface)",
    color:"var(--text-muted)", letterSpacing:".06em", textTransform:"uppercase",
  },

  hero: {
    maxWidth:"1280px", margin:"0 auto",
    padding:"52px 28px 36px", textAlign:"center",
    display:"flex", flexDirection:"column", alignItems:"center", gap:"16px",
  },
  eyebrow: {
    fontFamily:"var(--font-mono)", fontSize:".68rem",
    letterSpacing:".18em", color:"var(--cyan)",
    textTransform:"uppercase",
  },
  heroTitle: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"clamp(1.8rem,4.5vw,2.7rem)",
    color:"var(--text)", lineHeight:1.12, letterSpacing:"-.02em",
  },
  heroGrad: {
    background:"linear-gradient(135deg, var(--cyan) 0%, var(--indigo) 100%)",
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
  },
  heroSub: {
    fontFamily:"var(--font-body)", fontSize:".93rem",
    color:"var(--text-dim)", lineHeight:1.72, maxWidth:"540px",
  },
  factRow: {
    marginTop:"4px", paddingTop:"18px",
    borderTop:"1px solid var(--border)", width:"100%",
    display:"flex", justifyContent:"center",
  },

  main: {
    flex:1, maxWidth:"1280px", margin:"0 auto", width:"100%",
    padding:"0 28px 72px",
    display:"grid", gridTemplateColumns:"340px 1fr",
    gap:"24px", alignItems:"start",
  },
  aside: {
    display:"flex", flexDirection:"column", gap:"16px",
    position:"sticky", top:"76px",
  },
  panel: {
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", padding:"18px",
    display:"flex", flexDirection:"column", gap:"14px",
    boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
  },
  panelHead: { display:"flex", alignItems:"center", gap:"8px" },
  panelDot: {
    width:"6px", height:"6px", borderRadius:"50%",
    background:"var(--cyan)", boxShadow:"0 0 8px var(--cyan)",
  },
  panelTitle: {
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".82rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  infoHead: {
    fontFamily:"var(--font-mono)", fontSize:".6rem",
    letterSpacing:".14em", color:"var(--text-muted)",
  },
  pipeRow: {
    display:"flex", flexDirection:"column", gap:"3px",
    paddingBottom:"11px", borderBottom:"1px solid var(--border)",
  },
  pipeKey: {
    fontFamily:"var(--font-mono)", fontSize:".62rem",
    color:"var(--cyan-dim)", letterSpacing:".06em",
  },
  pipeVal: {
    fontFamily:"var(--font-body)", fontSize:".76rem",
    color:"var(--text-dim)", lineHeight:1.5,
  },

  resultsArea: { display:"flex", flexDirection:"column", minHeight:"440px" },
  stack: { display:"flex", flexDirection:"column", gap:"16px" },
  stackHead: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  statusRow: { display:"flex", alignItems:"center", gap:"8px" },
  statusDot: {
    width:"7px", height:"7px", borderRadius:"50%",
    background:"var(--green)", boxShadow:"0 0 8px var(--green)",
  },
  statusText: {
    fontFamily:"var(--font-mono)", fontSize:".72rem",
    color:"var(--green)", letterSpacing:".06em",
  },
  savedChip: {
    fontFamily:"var(--font-mono)", fontSize:".65rem",
    color:"var(--text-muted)", padding:"2px 8px",
    borderRadius:"3px", border:"1px solid var(--border)", background:"var(--surface)",
  },
  newBtn: {
    background:"transparent", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-sm)", color:"var(--text-muted)",
    fontFamily:"var(--font-body)", fontSize:".78rem",
    padding:"5px 13px", cursor:"pointer",
  },

  footer: {
    borderTop:"1px solid var(--border)", padding:"16px 28px",
    display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px",
    fontFamily:"var(--font-mono)", fontSize:".65rem",
    color:"var(--text-dim)", letterSpacing:".04em",
  },
};

const e = {
  wrap: {
    flex:1, display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    gap:"14px", minHeight:"440px",
    border:"1.5px dashed var(--border)", borderRadius:"var(--r-xl)",
  },
  title: {
    fontFamily:"var(--font-display)", fontWeight:500,
    fontSize:"1rem", color:"var(--text-dim)", letterSpacing:"-.01em",
  },
  sub: { fontFamily:"var(--font-body)", fontSize:".82rem", color:"var(--text-muted)" },
  spinner: {
    width:"40px", height:"40px", borderRadius:"50%",
    border:"3px solid var(--border-hi)", borderTopColor:"var(--cyan)",
    animation:"spin 1s linear infinite",
    boxShadow:"0 0 24px rgba(244,114,182,0.15)",
  },
};
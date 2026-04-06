import { useState } from "react";
import "./index.css";
import UploadPanel  from "./components/UploadPanel";
import ResultCard   from "./components/ResultCard";
import ExplainPanel from "./components/ExplainPanel";
import ReportPanel  from "./components/ReportPanel";

const PIPELINE = [
  ["Preprocessing",  "Circular crop · Green channel boost · CLAHE"],
  ["Backbones",      "ResNet-18 · GoogLeNet · EfficientNet-B4 · DenseNet-121 · ConvNeXt-Tiny"],
  ["Ensemble",       "SVM + Random Forest + XGBoost with Youden-J threshold"],
  ["Severity",       "Cascade SVM — NDR → MDR / PDR grading"],
  ["Explainability", "Grad-CAM · LIME superpixel · SHAP feature attribution"],
  ["AI Reports",     "Groq LLaMA-3 — clinical and patient-friendly narratives"],
];

export default function App() {
  const [result,   setResult]   = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [mainTab,  setMainTab]  = useState("analysis");  // "analysis" | "report"

  const handleResult = (data, prev) => {
    setResult(data); setPreview(prev); setLoading(false);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior:"smooth" }), 100);
  };

  const reset = () => { setResult(null); setPreview(null); setLoading(false); setMainTab("analysis"); };

  return (
    <div style={s.root}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span style={s.logoText}>Ocula<span style={s.logoDim}> DR</span></span>
          </div>
          <div style={s.headerRight}>
            <span style={s.badge}>98.50% Binary</span>
            <span style={s.badge}>90.68% Multiclass</span>
            <span style={s.badge}>5 CNN Backbones</span>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={s.hero}>
        <p style={s.eyebrow}>Automated Fundus Analysis · XAI-Powered</p>
        <h1 style={s.heroTitle}>
          Diabetic Retinopathy
          <br />
          <em style={s.heroItalic}>Screening & Grading</em>
        </h1>
        <p style={s.heroSub}>
          Upload a fundus photograph to receive automated DR classification,
          severity grading, explainability maps, and AI-generated clinical reports.
        </p>
      </section>

      {/* ── Main Layout ──────────────────────────────────────────── */}
      <main style={s.main}>

        {/* Left: upload + pipeline info */}
        <aside style={s.aside}>
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelDot} />
              <p style={s.panelTitle}>Upload Image</p>
            </div>
            <UploadPanel onResult={handleResult} onLoading={setLoading} />
          </div>

          <div style={s.infoPanel}>
            <p style={s.infoHeading}>Analysis Pipeline</p>
            {PIPELINE.map(([k, v]) => (
              <div key={k} style={s.pipeRow}>
                <p style={s.pipeKey}>{k}</p>
                <p style={s.pipeVal}>{v}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Right: results */}
        <section id="results" style={s.right}>

          {/* Empty state */}
          {!result && !loading && (
            <div style={s.empty}>
              <RetinalSVG />
              <p style={s.emptyTitle}>Ready to analyse</p>
              <p style={s.emptySub}>Upload a fundus photograph to begin.</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={s.loadState}>
              <div style={s.bigSpin} />
              <p style={s.loadTitle}>Analysing image…</p>
              <p style={s.loadSub}>Running full 5-backbone XAI pipeline</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div style={s.resultsWrap}>
              {/* Top bar: status + tab switcher + new image */}
              <div style={s.resultsBar}>
                <div style={s.statusPill}>
                  <div style={s.statusDot} />
                  Analysis complete
                </div>

                {/* Main tab switcher */}
                <div style={s.mainTabs}>
                  <button
                    style={{ ...s.mainTab, ...(mainTab==="analysis" ? s.mainTabOn : {}) }}
                    onClick={() => setMainTab("analysis")}
                  >
                    Results
                  </button>
                  <button
                    style={{ ...s.mainTab, ...(mainTab==="report" ? { ...s.mainTabOn, color:"var(--iris)" } : {}) }}
                    onClick={() => setMainTab("report")}
                  >
                    AI Report
                    {(result.clinical_report || result.patient_report) && (
                      <span style={s.newDot} />
                    )}
                  </button>
                </div>

                <button style={s.newBtn} onClick={reset}>← New image</button>
              </div>

              {/* Analysis tab */}
              {mainTab === "analysis" && (
                <div style={s.stack}>
                  <ResultCard result={result} />
                  <ExplainPanel
                    originalSrc={preview}
                    gradcam={result.gradcam_base64}
                    lime={result.lime_base64}
                    shap={result.shap_base64}
                  />
                </div>
              )}

              {/* Report tab */}
              {mainTab === "report" && (
                <ReportPanel result={result} />
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <span>Ocula DR Screening System</span>
        <span style={{color:"var(--text-muted)"}}>For research use only · Not a certified medical device</span>
      </footer>
    </div>
  );
}

function RetinalSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
      stroke="var(--border-hi)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
    </svg>
  );
}

const s = {
  root: { minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative" },

  header: {
    borderBottom:"1px solid var(--border)", background:"rgba(7,17,31,.9)",
    backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100,
  },
  headerInner: {
    maxWidth:"1280px", margin:"0 auto", padding:"0 28px", height:"58px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  },
  logo: { display:"flex", alignItems:"center", gap:"10px" },
  logoText: { fontFamily:"var(--sans)", fontWeight:700, fontSize:"1.15rem", color:"var(--text)" },
  logoDim:  { color:"var(--sage)", fontWeight:300 },
  headerRight: { display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"flex-end" },
  badge: {
    fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--text-muted)",
    padding:"3px 9px", borderRadius:"20px",
    border:"1px solid var(--border)", background:"var(--surface)",
    letterSpacing:".04em",
  },

  hero: {
    maxWidth:"1280px", margin:"0 auto",
    padding:"54px 28px 40px", textAlign:"center",
    position:"relative", zIndex:1,
  },
  eyebrow: {
    fontFamily:"var(--mono)", fontSize:".68rem",
    letterSpacing:".18em", color:"var(--sage)",
    textTransform:"uppercase", marginBottom:"14px",
  },
  heroTitle: {
    fontFamily:"var(--serif)",
    fontSize:"clamp(1.9rem,4.5vw,2.9rem)",
    color:"var(--text)", lineHeight:1.15,
    fontWeight:400, marginBottom:"16px",
  },
  heroItalic: {
    fontStyle:"italic",
    background:"linear-gradient(135deg, var(--sage) 0%, var(--iris) 100%)",
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
  },
  heroSub: {
    fontFamily:"var(--sans)", fontSize:".95rem",
    color:"var(--text-dim)", lineHeight:1.75,
    maxWidth:"560px", margin:"0 auto",
  },

  main: {
    flex:1, maxWidth:"1280px", margin:"0 auto", width:"100%",
    padding:"0 28px 72px",
    display:"grid", gridTemplateColumns:"320px 1fr",
    gap:"24px", alignItems:"start",
    position:"relative", zIndex:1,
  },
  aside: { display:"flex", flexDirection:"column", gap:"16px", position:"sticky", top:"74px" },

  panel: {
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", padding:"18px",
    display:"flex", flexDirection:"column", gap:"14px",
    boxShadow:"0 8px 28px rgba(0,0,0,0.3)",
  },
  panelHead: { display:"flex", alignItems:"center", gap:"8px" },
  panelDot: {
    width:"6px", height:"6px", borderRadius:"50%",
    background:"var(--sage)", boxShadow:"0 0 8px var(--sage)",
    animation:"softpulse 2.5s ease infinite",
  },
  panelTitle: { fontFamily:"var(--sans)", fontWeight:600, fontSize:".84rem", color:"var(--text)" },

  infoPanel: {
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", padding:"16px 18px",
    display:"flex", flexDirection:"column", gap:"12px",
    boxShadow:"0 8px 28px rgba(0,0,0,0.3)",
  },
  infoHeading: { fontFamily:"var(--mono)", fontSize:".58rem", letterSpacing:".14em", color:"var(--text-muted)" },
  pipeRow: {
    display:"flex", flexDirection:"column", gap:"3px",
    paddingBottom:"10px", borderBottom:"1px solid var(--border)",
  },
  pipeKey: { fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--sage-dim)", letterSpacing:".05em" },
  pipeVal: { fontFamily:"var(--sans)", fontSize:".76rem", color:"var(--text-dim)", lineHeight:1.5 },

  right: { display:"flex", flexDirection:"column", minHeight:"440px" },

  empty: {
    flex:1, display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", gap:"14px", minHeight:"440px",
    border:"1.5px dashed var(--border)", borderRadius:"var(--r-xl)",
  },
  emptyTitle: { fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--text-dim)", fontStyle:"italic" },
  emptySub:   { fontFamily:"var(--sans)", fontSize:".82rem", color:"var(--text-muted)" },

  loadState: {
    flex:1, display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", gap:"18px", minHeight:"440px",
  },
  bigSpin: {
    width:"44px", height:"44px", borderRadius:"50%",
    border:"3px solid var(--border-hi)", borderTopColor:"var(--sage)",
    animation:"spin .9s linear infinite",
    boxShadow:"0 0 20px rgba(94,234,212,0.15)",
  },
  loadTitle: { fontFamily:"var(--serif)", fontSize:"1.05rem", color:"var(--text)", fontStyle:"italic" },
  loadSub:   { fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--text-muted)", letterSpacing:".04em" },

  resultsWrap: { display:"flex", flexDirection:"column", gap:"14px" },
  resultsBar: {
    display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap",
  },
  statusPill: {
    display:"flex", alignItems:"center", gap:"7px",
    fontFamily:"var(--mono)", fontSize:".68rem", color:"var(--green)",
    letterSpacing:".06em",
  },
  statusDot: {
    width:"7px", height:"7px", borderRadius:"50%",
    background:"var(--green)", boxShadow:"0 0 8px var(--green)",
  },

  mainTabs: {
    display:"flex", background:"var(--surface)",
    borderRadius:"var(--r-md)", padding:"4px", gap:"4px",
  },
  mainTab: {
    position:"relative", display:"flex", alignItems:"center", gap:"6px",
    padding:"6px 18px", borderRadius:"var(--r-sm)", border:"none",
    background:"transparent", color:"var(--text-muted)",
    fontFamily:"var(--sans)", fontSize:".82rem", fontWeight:500,
    cursor:"pointer", transition:"all .15s",
  },
  mainTabOn: {
    background:"var(--card)", color:"var(--sage)",
    boxShadow:"0 1px 6px rgba(0,0,0,.35)",
  },
  newDot: {
    width:"6px", height:"6px", borderRadius:"50%",
    background:"var(--sage)", boxShadow:"0 0 6px var(--sage)",
  },
  newBtn: {
    marginLeft:"auto", background:"transparent",
    border:"1px solid var(--border-hi)", borderRadius:"var(--r-sm)",
    color:"var(--text-muted)", fontFamily:"var(--sans)", fontSize:".78rem",
    padding:"5px 13px", cursor:"pointer",
  },

  stack: { display:"flex", flexDirection:"column", gap:"14px" },

  footer: {
    borderTop:"1px solid var(--border)", padding:"14px 28px",
    display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px",
    fontFamily:"var(--mono)", fontSize:".63rem", color:"var(--text-dim)",
    letterSpacing:".04em", position:"relative", zIndex:1,
  },
};
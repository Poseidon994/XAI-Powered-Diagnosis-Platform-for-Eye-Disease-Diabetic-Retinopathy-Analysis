// import { useState, useEffect } from "react";
// import './ReportPanel.css';
// // Parse labelled sections from Groq output
// function parseSections(text) {
//   if (!text) return null;
//   const KEYS = [
//     "DIAGNOSIS & SEVERITY",
//     "OBSERVED BIOMARKERS",
//     "RISK STRATIFICATION",
//     "RECOMMENDED MANAGEMENT",
//     "FOLLOW-UP SCHEDULE",
//     "WHAT THE SCAN FOUND",
//     "WHAT THIS MEANS FOR YOUR EYES",
//     "WHAT THE AI NOTICED",
//     "NEXT STEPS",
//     "ENCOURAGEMENT",
//     "1.", "2.", "3.", "4.", "5.",        // numbered fallback
//   ];

//   // Try numbered headings first
//   const numbered = text.match(/^(\d+\.\s+\*\*[^*]+\*\*)/gm);
//   if (numbered && numbered.length >= 3) {
//     const parts = text.split(/(?=^\d+\.\s+\*\*)/m).filter(Boolean);
//     return parts.map(p => {
//       const match = p.match(/^\d+\.\s+\*\*([^*]+)\*\*[:\s]*([\s\S]*)/);
//       return match
//         ? { title: match[1].trim(), body: match[2].trim() }
//         : { title: "", body: p.trim() };
//     }).filter(x => x.body);
//   }

//   // Try ALL-CAPS section headings
//   const sections = [];
//   const lines = text.split("\n");
//   let cur = null;
//   for (const line of lines) {
//     const isHeading = /^[A-Z &—\-]{6,}$/.test(line.trim()) || /^\*\*[^*]+\*\*$/.test(line.trim());
//     if (isHeading) {
//       if (cur) sections.push(cur);
//       cur = { title: line.replace(/\*\*/g, "").trim(), body: "" };
//     } else if (cur) {
//       cur.body += line + "\n";
//     }
//   }
//   if (cur) sections.push(cur);
//   if (sections.length >= 2) return sections.map(s => ({ ...s, body: s.body.trim() }));

//   // Fallback: whole text as one block
//   return [{ title: "", body: text.trim() }];
// }

// function Section({ title, body, delay, color }) {
//   const [show, setShow] = useState(false);
//   useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
//   return (
//     <div style={{ ...s.section, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)", transition:"opacity .45s ease, transform .45s ease" }}>
//       {title && (
//         <div style={s.secHead}>
//           <div style={{ ...s.secAccent, background: color }} />
//           <p style={{ ...s.secTitle, color }}>{title}</p>
//         </div>
//       )}
//       <p style={s.secBody}>{body}</p>
//     </div>
//   );
// }

// export default function ReportPanel({ result }) {
//   const [mode, setMode] = useState("clinical");   // "clinical" | "patient"

//   if (!result) return null;
//   const { clinical_report, patient_report, binary_prediction, multiclass_prediction,
//           patient_id, dr_confidence, stage_guess, processing_time_ms,
//           gradcam_base64, lime_base64, shap_base64 } = result;

//   const text     = mode === "clinical" ? clinical_report : patient_report;
//   const sections = parseSections(text);

//   const sectionColor = mode === "clinical" ? "var(--sage)" : "var(--iris)";

//   const exportReport = () => {
//     const header = [
//       "════════════════════════════════════════════════",
//       "       DIABETIC RETINOPATHY SCREENING REPORT",
//       "════════════════════════════════════════════════",
//       `Generated  : ${new Date().toLocaleString()}`,
//       `Patient ID : ${patient_id}`,
//       `Result     : ${binary_prediction}`,
//       `Grade      : ${multiclass_prediction}`,
//       `Confidence : ${dr_confidence?.toFixed(2)}%`,
//       `Stage Est. : ${stage_guess} / 4`,
//       `Total Time : ${(processing_time_ms/1000).toFixed(1)}s`,
//       `Grad-CAM   : ${gradcam_base64 ? "Generated" : "Unavailable"}`,
//       `LIME       : ${lime_base64    ? "Generated" : "Unavailable"}`,
//       `SHAP       : ${shap_base64    ? "Generated" : "Unavailable"}`,
//       "────────────────────────────────────────────────",
//       "",
//     ].join("\n");

//     const clinSection = clinical_report
//       ? `CLINICAL REPORT\n${"─".repeat(48)}\n${clinical_report}\n\n`
//       : "";
//     const patSection = patient_report
//       ? `PATIENT EXPLANATION\n${"─".repeat(48)}\n${patient_report}\n\n`
//       : "";

//     const footer = [
//       "────────────────────────────────────────────────",
//       "DISCLAIMER",
//       "This report is AI-generated for clinical decision support only.",
//       "All findings must be confirmed by a qualified ophthalmologist.",
//       "════════════════════════════════════════════════",
//     ].join("\n");

//     const blob = new Blob([header + clinSection + patSection + footer], { type:"text/plain" });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement("a");
//     a.href = url;
//     a.download = `dr_report_${patient_id}_${Date.now()}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div style={s.card}>
//       {/* Header with toggle + export */}
//       <div style={s.header}>
//         <div>
//           <p style={s.title}>AI Clinical Reports</p>
//           <p style={s.sub}>Powered by Groq · LLaMA-3 · For specialist review</p>
//         </div>
//         <div style={s.headerActions}>
//           {/* Clinical / Patient toggle */}
//           <div style={s.toggle}>
//             <button
//               style={{ ...s.toggleBtn, ...(mode==="clinical" ? s.toggleOn : {}) }}
//               onClick={() => setMode("clinical")}
//             >
//               🩺 Clinical
//             </button>
//             <button
//               style={{ ...s.toggleBtn, ...(mode==="patient" ? { ...s.toggleOn, color:"var(--iris)" } : {}) }}
//               onClick={() => setMode("patient")}
//             >
//               💬 Patient
//             </button>
//           </div>
//           {/* Export */}
//           <button style={s.exportBtn} onClick={exportReport}>
//             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}>
//               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//               <polyline points="7 10 12 15 17 10"/>
//               <line x1="12" y1="15" x2="12" y2="3"/>
//             </svg>
//             Export Report
//           </button>
//         </div>
//       </div>

//       {/* Mode badge */}
//       <div style={s.modeBadgeRow}>
//         <div style={{ ...s.modeBadge, borderColor: mode==="clinical" ? "var(--sage)" : "var(--iris)", color: mode==="clinical" ? "var(--sage)" : "var(--iris)" }}>
//           {mode === "clinical" ? "Clinical Report — For Ophthalmologist" : "Patient Explanation — Plain Language"}
//         </div>
//         <span style={s.timestamp}>{new Date().toLocaleDateString()}</span>
//       </div>

//       {/* Content */}
//       <div style={s.body}>
//         {!text ? (
//           <div style={s.noReport}>
//             <p>Report not available.</p>
//             <p style={{marginTop:"6px", fontSize:".75rem"}}>Ensure GROQ_API_KEY is set in ml_service/.env</p>
//           </div>
//         ) : (
//           <div style={s.sections}>
//             {sections
//               ? sections.map((sec, i) => (
//                   <Section key={i} title={sec.title} body={sec.body} delay={i * 250} color={sectionColor} />
//                 ))
//               : <p style={s.rawText}>{text}</p>
//             }
//           </div>
//         )}
//       </div>

//       {/* Disclaimer */}
//       <div style={s.disclaimer}>
//         <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
//           <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
//           <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
//         </svg>
//         AI-generated clinical decision support only. Always confirm with a qualified ophthalmologist.
//       </div>
//     </div>
//   );
// }

// const s = {
//   card: {
//     background:"var(--card)", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)", overflow:"hidden",
//     boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
//     animation:"fadeUp .5s .2s cubic-bezier(.16,1,.3,1) both",
//   },
//   header: {
//     padding:"16px 20px", display:"flex",
//     justifyContent:"space-between", alignItems:"flex-start",
//     flexWrap:"wrap", gap:"12px",
//     borderBottom:"1px solid var(--border)",
//   },
//   title: { fontFamily:"var(--sans)", fontWeight:600, fontSize:".9rem", color:"var(--text)" },
//   sub:   { fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--text-muted)", marginTop:"3px" },
//   headerActions: { display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" },

//   toggle: { display:"flex", background:"var(--surface)", borderRadius:"var(--r-md)", padding:"4px", gap:"4px" },
//   toggleBtn: {
//     padding:"5px 14px", borderRadius:"var(--r-sm)", border:"none",
//     background:"transparent", color:"var(--text-muted)",
//     fontFamily:"var(--sans)", fontSize:".78rem", cursor:"pointer",
//     transition:"all .15s",
//   },
//   toggleOn: { background:"var(--card)", color:"var(--sage)", boxShadow:"0 1px 4px rgba(0,0,0,.3)" },

//   exportBtn: {
//     display:"flex", alignItems:"center",
//     padding:"7px 14px", borderRadius:"var(--r-md)",
//     border:"1px solid var(--sage-hi)", background:"var(--sage-glow)",
//     color:"var(--sage)", fontFamily:"var(--sans)", fontSize:".78rem",
//     fontWeight:500, cursor:"pointer",
//   },

//   modeBadgeRow: {
//     display:"flex", alignItems:"center", justifyContent:"space-between",
//     padding:"10px 20px", borderBottom:"1px solid var(--border)",
//   },
//   modeBadge: {
//     fontFamily:"var(--mono)", fontSize:".65rem", letterSpacing:".06em",
//     padding:"3px 12px", borderRadius:"20px",
//     border:"1px solid", background:"transparent",
//   },
//   timestamp: { fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--text-muted)" },

//   body: { padding:"20px", maxHeight:"480px", overflowY:"auto" },
//   sections: { display:"flex", flexDirection:"column", gap:"18px" },
//   section: { display:"flex", flexDirection:"column", gap:"8px" },
//   secHead: { display:"flex", alignItems:"center", gap:"8px" },
//   secAccent: { width:"3px", height:"16px", borderRadius:"2px", flexShrink:0 },
//   secTitle: { fontFamily:"var(--mono)", fontSize:".65rem", letterSpacing:".12em", fontWeight:500 },
//   secBody: {
//     fontFamily:"var(--sans)", fontSize:".83rem",
//     color:"var(--text-dim)", lineHeight:1.72,
//     paddingLeft:"14px", borderLeft:"1px solid var(--border)",
//     whiteSpace:"pre-wrap",
//   },
//   rawText: {
//     fontFamily:"var(--sans)", fontSize:".83rem",
//     color:"var(--text-dim)", lineHeight:1.72, whiteSpace:"pre-wrap",
//   },
//   noReport: {
//     fontFamily:"var(--mono)", fontSize:".78rem",
//     color:"var(--text-muted)", textAlign:"center",
//     padding:"40px 20px",
//   },

//   disclaimer: {
//     display:"flex", alignItems:"center", gap:"8px",
//     padding:"10px 20px", borderTop:"1px solid var(--border)",
//     background:"rgba(252,211,77,0.04)",
//     fontFamily:"var(--mono)", fontSize:".65rem",
//     color:"rgba(252,211,77,.75)", lineHeight:1.5,
//   },
// };
export default function ReportDownload({ result, role }) {
  if (!result) return null;

  const isClinician = role === "clinician";

  const download = () => {
    const report = isClinician
      ? (result.ai_explanation || "No clinical report available.")
      : (result.ai_explanation_patient || result.ai_explanation || "No report available.");

    const lines = [
      "═══════════════════════════════════════════════",
      `     OCULA DR — ${isClinician ? "CLINICAL REPORT" : "PATIENT REPORT"}`,
      "═══════════════════════════════════════════════",
      `Generated  : ${new Date().toLocaleString()}`,
      `Patient ID : ${result.patient_id}`,
      "───────────────────────────────────────────────",
      "CLASSIFICATION RESULTS",
      `  Binary Result    : ${result.binary_prediction}`,
      `  Severity Grade   : ${result.multiclass_prediction}`,
      `  Confidence       : ${result.dr_confidence?.toFixed(2)}%`,
      `  APTOS Stage Est. : ${result.stage_guess} / 4`,
      `  Processing Time  : ${(result.processing_time_ms/1000).toFixed(2)}s`,
      "───────────────────────────────────────────────",
      "EXPLAINABILITY",
      `  Grad-CAM : ${result.gradcam_base64 ? "Generated" : "Unavailable"}`,
      `  LIME     : ${result.lime_base64    ? "Generated" : "Unavailable"}`,
      `  SHAP     : ${result.shap_base64    ? "Generated" : "Unavailable"}`,
      "───────────────────────────────────────────────",
      isClinician ? "CLINICAL NARRATIVE" : "YOUR RESULTS EXPLAINED",
      "",
      report,
      "───────────────────────────────────────────────",
      "DISCLAIMER",
      "This report is AI-generated for decision support only.",
      "It does not constitute a medical diagnosis.",
      isClinician
        ? "All findings must be confirmed by clinical examination."
        : "Please discuss these results with your doctor.",
      "═══════════════════════════════════════════════",
    ];

    const blob = new Blob([lines.join("\n")], { type:"text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `ocula_${isClinician ? "clinical" : "patient"}_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={s.card} className="fadeUp-3">
      <div style={s.row}>
        <div style={s.left}>
          <div style={s.icon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <p style={s.title}>Download Report</p>
            <p style={s.sub}>
              {isClinician
                ? "Full clinical results + AI narrative · .txt"
                : "Your scan results + plain-language summary · .txt"}
            </p>
          </div>
        </div>
        <button style={s.btn} onClick={download}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            strokeLinejoin="round" style={{marginRight:7}}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export .txt
        </button>
      </div>
    </div>
  );
}

const s = {
  card: {
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
  },
  row: {
    display:"flex", alignItems:"center",
    justifyContent:"space-between", gap:"16px",
    padding:"16px 22px", flexWrap:"wrap",
  },
  left: { display:"flex", alignItems:"center", gap:"12px" },
  icon: {
    width:"34px", height:"34px", borderRadius:"var(--r-sm)",
    background:"var(--cyan-glow)",
    border:"1px solid rgba(244,114,182,0.25)",
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  title: {
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".88rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  sub: {
    fontFamily:"var(--font-mono)", fontSize:".63rem",
    color:"var(--text-muted)", marginTop:"3px",
  },
  btn: {
    display:"flex", alignItems:"center",
    padding:"9px 18px", borderRadius:"var(--r-md)",
    border:"1px solid rgba(244,114,182,0.35)",
    background:"var(--cyan-glow)", color:"var(--cyan)",
    fontFamily:"var(--font-body)", fontSize:".82rem", fontWeight:500,
    cursor:"pointer", boxShadow:"0 2px 12px rgba(244,114,182,0.15)",
  },
};
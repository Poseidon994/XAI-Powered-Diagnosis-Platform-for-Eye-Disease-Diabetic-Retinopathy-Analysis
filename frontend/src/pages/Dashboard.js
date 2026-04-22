// import { useState, useEffect } from "react";

// const API = "http://localhost:5000";

// const GRADE_COLOR = {
//   "No DR": "var(--green)",
//   "NDR":   "var(--green)",
//   "MDR":   "var(--amber)",
//   "PDR":   "var(--red)",
//   "DR":    "var(--amber)",
// };

// function resolveGradeColor(prediction) {
//   if (!prediction) return "var(--text-muted)";
//   for (const [k, v] of Object.entries(GRADE_COLOR)) {
//     if (prediction.includes(k)) return v;
//   }
//   return "var(--text-muted)";
// }

// function formatDate(str) {
//   return new Date(str).toLocaleString("en-GB", {
//     day:"2-digit", month:"short", year:"numeric",
//     hour:"2-digit", minute:"2-digit",
//   });
// }

// export default function Dashboard({ user, token, onNewScan, onLogout }) {
//   const [scans,   setScans]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState(null);
//   const [detail,  setDetail]  = useState(null);   // full scan for modal
//   const [detailLoading, setDetailLoading] = useState(false);

//   useEffect(() => {
//     fetch(`${API}/api/scans`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(r => r.json())
//       .then(j => {
//         if (j.success) setScans(j.scans);
//         else setError(j.error);
//       })
//       .catch(() => setError("Could not load scan history."))
//       .finally(() => setLoading(false));
//   }, [token]);

//   const openScan = async (id) => {
//     setDetailLoading(true);
//     try {
//       const r = await fetch(`${API}/api/scans/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const j = await r.json();
//       if (j.success) setDetail(j.scan);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   return (
//     <div style={s.root}>
//       {/* Header */}
//       <header style={s.header}>
//         <div style={s.headerInner}>
//           <div style={s.logo}>
//             <div style={s.logoDot} />
//             <span style={s.logoText}>OCU<span style={s.logoAccent}>LA</span></span>
//             <span style={s.roleTag}>{user.role}</span>
//           </div>
//           <div style={s.headerRight}>
//             <span style={s.userName}>{user.name}</span>
//             <button style={s.newScanBtn} onClick={onNewScan}>+ New Scan</button>
//             <button style={s.logoutBtn} onClick={onLogout}>Sign Out</button>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main style={s.main} className="z1">
//         <div style={s.pageHeader}>
//           <div>
//             <h1 style={s.pageTitle}>
//               {user.role === "clinician" ? "Patient Scans" : "My Scan History"}
//             </h1>
//             <p style={s.pageSub}>
//               {user.role === "clinician"
//                 ? "All patient scans processed through Ocula DR"
//                 : "Your diabetic retinopathy screening results"}
//             </p>
//           </div>
//           <div style={s.statRow}>
//             <StatChip label="Total scans" value={scans.length} />
//             <StatChip label="DR detected"
//               value={scans.filter(s => s.binary_prediction?.includes("Detected")).length}
//               color="var(--amber)" />
//             <StatChip label="No DR"
//               value={scans.filter(s => !s.binary_prediction?.includes("Detected")).length}
//               color="var(--green)" />
//           </div>
//         </div>

//         {loading && <LoadingState />}
//         {error   && <ErrorState msg={error} />}

//         {!loading && !error && scans.length === 0 && (
//           <EmptyState role={user.role} onNewScan={onNewScan} />
//         )}

//         {!loading && scans.length > 0 && (
//           <div style={s.tableWrap}>
//             <table style={s.table}>
//               <thead>
//                 <tr>
//                   {user.role === "clinician" && <Th>Patient</Th>}
//                   <Th>Date</Th>
//                   <Th>Binary Result</Th>
//                   <Th>Severity</Th>
//                   <Th>Confidence</Th>
//                   <Th>Stage</Th>
//                   <Th>Time</Th>
//                   <Th></Th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {scans.map((scan, i) => (
//                   <tr key={scan.id} style={{ ...s.tr, animationDelay:`${i * 30}ms` }}>
//                     {user.role === "clinician" && (
//                       <td style={s.td}>
//                         <span style={s.patientName}>{scan.patient_name || "—"}</span>
//                       </td>
//                     )}
//                     <td style={s.td}>
//                       <span style={s.dateText}>{formatDate(scan.created_at)}</span>
//                     </td>
//                     <td style={s.td}>
//                       <span style={{ ...s.badge, color:resolveGradeColor(scan.binary_prediction),
//                         borderColor:resolveGradeColor(scan.binary_prediction) }}>
//                         {scan.binary_prediction?.includes("Detected") ? "DR +" : "No DR"}
//                       </span>
//                     </td>
//                     <td style={s.td}>
//                       <span style={{ color:resolveGradeColor(scan.multiclass_prediction),
//                         fontFamily:"var(--font-mono)", fontSize:".75rem" }}>
//                         {scan.multiclass_prediction?.match(/\(([^)]+)\)/)?.[1] || "—"}
//                       </span>
//                     </td>
//                     <td style={s.td}>
//                       <span style={s.conf}>{scan.dr_confidence?.toFixed(1)}%</span>
//                     </td>
//                     <td style={s.td}>
//                       <span style={s.stage}>{scan.stage_guess ?? "—"} / 4</span>
//                     </td>
//                     <td style={s.td}>
//                       <span style={s.time}>{scan.processing_time_ms
//                         ? `${(scan.processing_time_ms/1000).toFixed(1)}s` : "—"}</span>
//                     </td>
//                     <td style={s.td}>
//                       <button style={s.viewBtn} onClick={() => openScan(scan.id)}>
//                         View →
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </main>

//       {/* Detail modal */}
//       {(detail || detailLoading) && (
//         <ScanModal
//           scan={detail}
//           loading={detailLoading}
//           role={user.role}
//           onClose={() => setDetail(null)}
//         />
//       )}
//     </div>
//   );
// }

// /* ── Sub-components ───────────────────────────────────────────────── */

// function StatChip({ label, value, color }) {
//   return (
//     <div style={sc.chip}>
//       <span style={{ ...sc.val, color: color || "var(--text)" }}>{value}</span>
//       <span style={sc.lbl}>{label}</span>
//     </div>
//   );
// }

// function Th({ children }) {
//   return <th style={{ fontFamily:"var(--font-mono)", fontSize:".6rem",
//     letterSpacing:".1em", color:"var(--text-muted)", padding:"10px 14px",
//     textAlign:"left", borderBottom:"1px solid var(--border)", fontWeight:400,
//     textTransform:"uppercase" }}>{children}</th>;
// }

// function LoadingState() {
//   return (
//     <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
//       gap:"14px", padding:"80px 0" }}>
//       <div style={{ width:"28px", height:"28px", borderRadius:"50%",
//         border:"2px solid var(--border-hi)", borderTopColor:"var(--cyan)",
//         animation:"spin .8s linear infinite" }} />
//       <span style={{ fontFamily:"var(--font-mono)", fontSize:".78rem",
//         color:"var(--text-muted)" }}>Loading scan history…</span>
//     </div>
//   );
// }

// function ErrorState({ msg }) {
//   return (
//     <div style={{ padding:"20px", borderRadius:"var(--r-lg)",
//       background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.25)",
//       color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:".78rem" }}>
//       {msg}
//     </div>
//   );
// }

// function EmptyState({ role, onNewScan }) {
//   return (
//     <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
//       justifyContent:"center", gap:"16px", padding:"80px 0",
//       border:"1.5px dashed var(--border)", borderRadius:"var(--r-xl)" }}>
//       <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
//         stroke="var(--border-hi)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
//       </svg>
//       <p style={{ fontFamily:"var(--font-display)", fontWeight:500, fontSize:".95rem",
//         color:"var(--text-dim)" }}>
//         {role === "clinician" ? "No patient scans yet" : "No scans yet"}
//       </p>
//       <p style={{ fontFamily:"var(--font-body)", fontSize:".82rem", color:"var(--text-muted)" }}>
//         {role === "patient" ? "Start by uploading a fundus image." : "Patient scans will appear here."}
//       </p>
//       {role === "patient" && (
//         <button onClick={onNewScan} style={{ padding:"9px 20px",
//           borderRadius:"var(--r-md)", border:"none",
//           background:"var(--cyan)", color:"var(--bg)",
//           fontFamily:"var(--font-display)", fontWeight:600, fontSize:".78rem",
//           cursor:"pointer" }}>
//           Start New Scan
//         </button>
//       )}
//     </div>
//   );
// }

// function ScanModal({ scan, loading, role, onClose }) {
//   const report = role === "patient"
//     ? scan?.ai_explanation_patient
//     : scan?.ai_explanation_clinical ?? scan?.ai_explanation;

//   return (
//     <div style={m.overlay} onClick={onClose}>
//       <div style={m.modal} onClick={e => e.stopPropagation()}>
//         <div style={m.modalHeader}>
//           <p style={m.modalTitle}>Scan Detail</p>
//           <button style={m.closeBtn} onClick={onClose}>✕</button>
//         </div>
//         {loading && (
//           <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}>
//             <div style={{ width:"24px", height:"24px", borderRadius:"50%",
//               border:"2px solid var(--border-hi)", borderTopColor:"var(--cyan)",
//               animation:"spin .8s linear infinite" }} />
//           </div>
//         )}
//         {scan && !loading && (
//           <div style={m.body}>
//             {/* Grad-CAM */}
//             {scan.gradcam_base64 && (
//               <div style={m.section}>
//                 <p style={m.sectionLabel}>GRAD-CAM</p>
//                 <img src={`data:image/png;base64,${scan.gradcam_base64}`}
//                   alt="GradCAM" style={m.heatmap} />
//               </div>
//             )}

//             {/* Results */}
//             <div style={m.grid2}>
//               <MetaItem label="Binary Result" value={scan.binary_prediction} />
//               <MetaItem label="Severity"      value={scan.multiclass_prediction} />
//               <MetaItem label="Confidence"    value={`${scan.dr_confidence?.toFixed(2)}%`} />
//               <MetaItem label="Stage"         value={`${scan.stage_guess} / 4`} />
//             </div>

//             {/* AI Report */}
//             {report && (
//               <div style={m.section}>
//                 <p style={m.sectionLabel}>
//                   {role === "patient" ? "YOUR RESULTS EXPLAINED" : "CLINICAL REPORT"}
//                 </p>
//                 <p style={m.reportText}>{report}</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function MetaItem({ label, value }) {
//   return (
//     <div style={{ display:"flex", flexDirection:"column", gap:"4px",
//       padding:"12px 14px", borderRadius:"var(--r-md)",
//       background:"var(--surface)", border:"1px solid var(--border)" }}>
//       <span style={{ fontFamily:"var(--font-mono)", fontSize:".6rem",
//         letterSpacing:".1em", color:"var(--text-muted)", textTransform:"uppercase" }}>
//         {label}
//       </span>
//       <span style={{ fontFamily:"var(--font-body)", fontSize:".85rem",
//         color:"var(--text)", lineHeight:1.4 }}>
//         {value || "—"}
//       </span>
//     </div>
//   );
// }

// /* ── Styles ──────────────────────────────────────────────────────── */
// const s = {
//   root:  { minHeight:"100vh", display:"flex", flexDirection:"column" },
//   header: {
//     borderBottom:"1px solid var(--border)",
//     background:"rgba(13,11,21,.9)",
//     backdropFilter:"blur(14px)",
//     position:"sticky", top:0, zIndex:100,
//   },
//   headerInner: {
//     maxWidth:"1200px", margin:"0 auto",
//     padding:"0 28px", height:"60px",
//     display:"flex", alignItems:"center", justifyContent:"space-between",
//   },
//   logo: { display:"flex", alignItems:"center", gap:"10px" },
//   logoDot: {
//     width:"7px", height:"7px", borderRadius:"50%",
//     background:"var(--cyan)", boxShadow:"0 0 8px var(--cyan)",
//     animation:"blink 2.8s ease infinite",
//   },
//   logoText: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"1.1rem", color:"var(--text)", letterSpacing:".06em",
//   },
//   logoAccent: { color:"var(--cyan)" },
//   roleTag: {
//     fontFamily:"var(--font-mono)", fontSize:".6rem",
//     padding:"2px 8px", borderRadius:"3px",
//     border:"1px solid var(--border)", background:"var(--surface)",
//     color:"var(--text-muted)", letterSpacing:".06em",
//     textTransform:"uppercase",
//   },
//   headerRight: { display:"flex", alignItems:"center", gap:"12px" },
//   userName: {
//     fontFamily:"var(--font-body)", fontSize:".85rem",
//     color:"var(--text-dim)",
//   },
//   newScanBtn: {
//     padding:"7px 16px", borderRadius:"var(--r-md)", border:"none",
//     background:"var(--cyan)", color:"var(--bg)",
//     fontFamily:"var(--font-display)", fontWeight:600,
//     fontSize:".75rem", cursor:"pointer",
//     boxShadow:"0 2px 12px rgba(244,114,182,0.3)",
//   },
//   logoutBtn: {
//     padding:"7px 14px", borderRadius:"var(--r-md)",
//     border:"1px solid var(--border-hi)",
//     background:"transparent", color:"var(--text-muted)",
//     fontFamily:"var(--font-body)", fontSize:".78rem",
//     cursor:"pointer",
//   },

//   main: {
//     flex:1, maxWidth:"1200px", margin:"0 auto", width:"100%",
//     padding:"40px 28px 60px",
//     display:"flex", flexDirection:"column", gap:"28px",
//   },
//   pageHeader: {
//     display:"flex", justifyContent:"space-between",
//     alignItems:"flex-start", flexWrap:"wrap", gap:"20px",
//   },
//   pageTitle: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"1.4rem", color:"var(--text)", letterSpacing:"-.02em",
//   },
//   pageSub: {
//     fontFamily:"var(--font-body)", fontSize:".85rem",
//     color:"var(--text-muted)", marginTop:"6px",
//   },
//   statRow: { display:"flex", gap:"8px" },

//   tableWrap: {
//     background:"var(--card)",
//     border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)",
//     overflow:"hidden",
//     boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
//   },
//   table: { width:"100%", borderCollapse:"collapse" },
//   tr: {
//     borderBottom:"1px solid var(--border)",
//     transition:"background .12s",
//     animation:"slideIn .3s ease both",
//   },
//   td: { padding:"13px 14px", verticalAlign:"middle" },
//   patientName: {
//     fontFamily:"var(--font-body)", fontSize:".85rem", color:"var(--text)",
//   },
//   dateText: {
//     fontFamily:"var(--font-mono)", fontSize:".72rem", color:"var(--text-dim)",
//   },
//   badge: {
//     fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".06em",
//     padding:"3px 9px", borderRadius:"20px", border:"1px solid",
//     background:"transparent",
//   },
//   conf:  { fontFamily:"var(--font-mono)", fontSize:".78rem", color:"var(--text)" },
//   stage: { fontFamily:"var(--font-mono)", fontSize:".72rem", color:"var(--text-muted)" },
//   time:  { fontFamily:"var(--font-mono)", fontSize:".68rem", color:"var(--text-muted)" },
//   viewBtn: {
//     padding:"5px 13px", borderRadius:"var(--r-sm)",
//     border:"1px solid var(--border-hi)",
//     background:"transparent", color:"var(--cyan)",
//     fontFamily:"var(--font-body)", fontSize:".78rem",
//     cursor:"pointer", transition:"background .12s",
//   },
// };

// const sc = {
//   chip: {
//     display:"flex", flexDirection:"column", alignItems:"center",
//     padding:"10px 18px",
//     background:"var(--card)", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-lg)", gap:"3px",
//     boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
//   },
//   val: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"1.2rem", letterSpacing:"-.01em",
//   },
//   lbl: {
//     fontFamily:"var(--font-mono)", fontSize:".6rem",
//     letterSpacing:".08em", color:"var(--text-muted)",
//   },
// };

// const m = {
//   overlay: {
//     position:"fixed", inset:0, zIndex:200,
//     background:"rgba(13,11,21,.75)", backdropFilter:"blur(6px)",
//     display:"flex", alignItems:"center", justifyContent:"center",
//     padding:"24px",
//   },
//   modal: {
//     width:"100%", maxWidth:"640px", maxHeight:"85vh",
//     background:"var(--card)", border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)",
//     overflow:"hidden auto",
//     boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
//     animation:"fadeUp .35s cubic-bezier(.16,1,.3,1) both",
//   },
//   modalHeader: {
//     display:"flex", justifyContent:"space-between", alignItems:"center",
//     padding:"18px 22px", borderBottom:"1px solid var(--border)",
//     position:"sticky", top:0, background:"var(--card)", zIndex:1,
//   },
//   modalTitle: {
//     fontFamily:"var(--font-display)", fontWeight:600,
//     fontSize:".9rem", color:"var(--text)", letterSpacing:"-.01em",
//   },
//   closeBtn: {
//     background:"transparent", border:"1px solid var(--border)",
//     borderRadius:"var(--r-sm)", color:"var(--text-muted)",
//     width:"28px", height:"28px", cursor:"pointer",
//     fontFamily:"var(--font-body)", fontSize:".82rem",
//     display:"flex", alignItems:"center", justifyContent:"center",
//   },
//   body: {
//     padding:"20px 22px",
//     display:"flex", flexDirection:"column", gap:"18px",
//   },
//   section: { display:"flex", flexDirection:"column", gap:"10px" },
//   sectionLabel: {
//     fontFamily:"var(--font-mono)", fontSize:".6rem",
//     letterSpacing:".14em", color:"var(--text-muted)",
//   },
//   heatmap: {
//     width:"100%", borderRadius:"var(--r-md)",
//     border:"1px solid var(--border)",
//   },
//   grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" },
//   reportText: {
//     fontFamily:"var(--font-body)", fontSize:".83rem",
//     color:"var(--text-dim)", lineHeight:1.72,
//     whiteSpace:"pre-wrap",
//     padding:"14px 16px",
//     background:"var(--surface)",
//     borderRadius:"var(--r-md)",
//     border:"1px solid var(--border)",
//   },
// };
import { useState, useEffect } from "react";
import API_URL from "../config";

const API = API_URL;

const GRADE_COLOR = {
  "No DR": "var(--green)",
  "NDR":   "var(--green)",
  "MDR":   "var(--amber)",
  "PDR":   "var(--red)",
  "DR":    "var(--amber)",
};

function resolveGradeColor(prediction) {
  if (!prediction) return "var(--text-muted)";
  for (const [k, v] of Object.entries(GRADE_COLOR)) {
    if (prediction.includes(k)) return v;
  }
  return "var(--text-muted)";
}

function formatDate(str) {
  return new Date(str).toLocaleString("en-GB", {
    day:"2-digit", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit",
  });
}

export default function Dashboard({ user, token, onNewScan, onLogout }) {
  const [scans,   setScans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [detail,  setDetail]  = useState(null);   // full scan for modal
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/scans`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) setScans(j.scans);
        else setError(j.error);
      })
      .catch(() => setError("Could not load scan history."))
      .finally(() => setLoading(false));
  }, [token]);

  const openScan = async (id) => {
    setDetailLoading(true);
    try {
      const r = await fetch(`${API}/api/scans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (j.success) setDetail(j.scan);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoDot} />
            <span style={s.logoText}>OCU<span style={s.logoAccent}>LA</span></span>
            <span style={s.roleTag}>{user.role}</span>
          </div>
          <div style={s.headerRight}>
            <span style={s.userName}>{user.name}</span>
            <button style={s.newScanBtn} onClick={onNewScan}>+ New Scan</button>
            <button style={s.logoutBtn} onClick={onLogout}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={s.main} className="z1">
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>
              {user.role === "clinician" ? "Patient Scans" : "My Scan History"}
            </h1>
            <p style={s.pageSub}>
              {user.role === "clinician"
                ? "All patient scans processed through Ocula DR"
                : "Your diabetic retinopathy screening results"}
            </p>
          </div>
          <div style={s.statRow}>
            <StatChip label="Total scans" value={scans.length} />
            <StatChip label="DR detected"
              value={scans.filter(s => s.binary_prediction?.includes("Detected")).length}
              color="var(--amber)" />
            <StatChip label="No DR"
              value={scans.filter(s => !s.binary_prediction?.includes("Detected")).length}
              color="var(--green)" />
          </div>
        </div>

        {loading && <LoadingState />}
        {error   && <ErrorState msg={error} />}

        {!loading && !error && scans.length === 0 && (
          <EmptyState role={user.role} onNewScan={onNewScan} />
        )}

        {!loading && scans.length > 0 && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {user.role === "clinician" && <Th>Patient</Th>}
                  <Th>Date</Th>
                  <Th>Binary Result</Th>
                  <Th>Severity</Th>
                  <Th>Confidence</Th>
                  <Th>Stage</Th>
                  <Th>Time</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, i) => (
                  <tr key={scan.id} style={{ ...s.tr, animationDelay:`${i * 30}ms` }}>
                    {user.role === "clinician" && (
                      <td style={s.td}>
                        <span style={s.patientName}>{scan.patient_name || "—"}</span>
                      </td>
                    )}
                    <td style={s.td}>
                      <span style={s.dateText}>{formatDate(scan.created_at)}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, color:resolveGradeColor(scan.binary_prediction),
                        borderColor:resolveGradeColor(scan.binary_prediction) }}>
                        {scan.binary_prediction?.includes("Detected") ? "DR +" : "No DR"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ color:resolveGradeColor(scan.multiclass_prediction),
                        fontFamily:"var(--font-mono)", fontSize:".75rem" }}>
                        {scan.multiclass_prediction?.match(/\(([^)]+)\)/)?.[1] || "—"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={s.conf}>{scan.dr_confidence?.toFixed(1)}%</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.stage}>{scan.stage_guess ?? "—"} / 4</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.time}>{scan.processing_time_ms
                        ? `${(scan.processing_time_ms/1000).toFixed(1)}s` : "—"}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.viewBtn} onClick={() => openScan(scan.id)}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Detail modal */}
      {(detail || detailLoading) && (
        <ScanModal
          scan={detail}
          loading={detailLoading}
          role={user.role}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function StatChip({ label, value, color }) {
  return (
    <div style={sc.chip}>
      <span style={{ ...sc.val, color: color || "var(--text)" }}>{value}</span>
      <span style={sc.lbl}>{label}</span>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ fontFamily:"var(--font-mono)", fontSize:".6rem",
    letterSpacing:".1em", color:"var(--text-muted)", padding:"10px 14px",
    textAlign:"left", borderBottom:"1px solid var(--border)", fontWeight:400,
    textTransform:"uppercase" }}>{children}</th>;
}

function LoadingState() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      gap:"14px", padding:"80px 0" }}>
      <div style={{ width:"28px", height:"28px", borderRadius:"50%",
        border:"2px solid var(--border-hi)", borderTopColor:"var(--cyan)",
        animation:"spin .8s linear infinite" }} />
      <span style={{ fontFamily:"var(--font-mono)", fontSize:".78rem",
        color:"var(--text-muted)" }}>Loading scan history…</span>
    </div>
  );
}

function ErrorState({ msg }) {
  return (
    <div style={{ padding:"20px", borderRadius:"var(--r-lg)",
      background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.25)",
      color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:".78rem" }}>
      {msg}
    </div>
  );
}

function EmptyState({ role, onNewScan }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap:"16px", padding:"80px 0",
      border:"1.5px dashed var(--border)", borderRadius:"var(--r-xl)" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="var(--border-hi)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
      <p style={{ fontFamily:"var(--font-display)", fontWeight:500, fontSize:".95rem",
        color:"var(--text-dim)" }}>
        {role === "clinician" ? "No patient scans yet" : "No scans yet"}
      </p>
      <p style={{ fontFamily:"var(--font-body)", fontSize:".82rem", color:"var(--text-muted)" }}>
        {role === "patient" ? "Start by uploading a fundus image." : "Patient scans will appear here."}
      </p>
      {role === "patient" && (
        <button onClick={onNewScan} style={{ padding:"9px 20px",
          borderRadius:"var(--r-md)", border:"none",
          background:"var(--cyan)", color:"var(--bg)",
          fontFamily:"var(--font-display)", fontWeight:600, fontSize:".78rem",
          cursor:"pointer" }}>
          Start New Scan
        </button>
      )}
    </div>
  );
}

function ScanModal({ scan, loading, role, onClose }) {
  const report = role === "patient"
    ? scan?.ai_explanation_patient
    : scan?.ai_explanation_clinical ?? scan?.ai_explanation;

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.modalHeader}>
          <p style={m.modalTitle}>Scan Detail</p>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>
        {loading && (
          <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}>
            <div style={{ width:"24px", height:"24px", borderRadius:"50%",
              border:"2px solid var(--border-hi)", borderTopColor:"var(--cyan)",
              animation:"spin .8s linear infinite" }} />
          </div>
        )}
        {scan && !loading && (
          <div style={m.body}>
            {/* Grad-CAM */}
            {scan.gradcam_base64 && (
              <div style={m.section}>
                <p style={m.sectionLabel}>GRAD-CAM</p>
                <img src={`data:image/png;base64,${scan.gradcam_base64}`}
                  alt="GradCAM" style={m.heatmap} />
              </div>
            )}

            {/* Results */}
            <div style={m.grid2}>
              <MetaItem label="Binary Result" value={scan.binary_prediction} />
              <MetaItem label="Severity"      value={scan.multiclass_prediction} />
              <MetaItem label="Confidence"    value={`${scan.dr_confidence?.toFixed(2)}%`} />
              <MetaItem label="Stage"         value={`${scan.stage_guess} / 4`} />
            </div>

            {/* AI Report */}
            {report && (
              <div style={m.section}>
                <p style={m.sectionLabel}>
                  {role === "patient" ? "YOUR RESULTS EXPLAINED" : "CLINICAL REPORT"}
                </p>
                <p style={m.reportText}>{report}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"4px",
      padding:"12px 14px", borderRadius:"var(--r-md)",
      background:"var(--surface)", border:"1px solid var(--border)" }}>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:".6rem",
        letterSpacing:".1em", color:"var(--text-muted)", textTransform:"uppercase" }}>
        {label}
      </span>
      <span style={{ fontFamily:"var(--font-body)", fontSize:".85rem",
        color:"var(--text)", lineHeight:1.4 }}>
        {value || "—"}
      </span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const s = {
  root:  { minHeight:"100vh", display:"flex", flexDirection:"column" },
  header: {
    borderBottom:"1px solid var(--border)",
    background:"rgba(13,11,21,.9)",
    backdropFilter:"blur(14px)",
    position:"sticky", top:0, zIndex:100,
  },
  headerInner: {
    maxWidth:"1200px", margin:"0 auto",
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
  roleTag: {
    fontFamily:"var(--font-mono)", fontSize:".6rem",
    padding:"2px 8px", borderRadius:"3px",
    border:"1px solid var(--border)", background:"var(--surface)",
    color:"var(--text-muted)", letterSpacing:".06em",
    textTransform:"uppercase",
  },
  headerRight: { display:"flex", alignItems:"center", gap:"12px" },
  userName: {
    fontFamily:"var(--font-body)", fontSize:".85rem",
    color:"var(--text-dim)",
  },
  newScanBtn: {
    padding:"7px 16px", borderRadius:"var(--r-md)", border:"none",
    background:"var(--cyan)", color:"var(--bg)",
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".75rem", cursor:"pointer",
    boxShadow:"0 2px 12px rgba(244,114,182,0.3)",
  },
  logoutBtn: {
    padding:"7px 14px", borderRadius:"var(--r-md)",
    border:"1px solid var(--border-hi)",
    background:"transparent", color:"var(--text-muted)",
    fontFamily:"var(--font-body)", fontSize:".78rem",
    cursor:"pointer",
  },

  main: {
    flex:1, maxWidth:"1200px", margin:"0 auto", width:"100%",
    padding:"40px 28px 60px",
    display:"flex", flexDirection:"column", gap:"28px",
  },
  pageHeader: {
    display:"flex", justifyContent:"space-between",
    alignItems:"flex-start", flexWrap:"wrap", gap:"20px",
  },
  pageTitle: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"1.4rem", color:"var(--text)", letterSpacing:"-.02em",
  },
  pageSub: {
    fontFamily:"var(--font-body)", fontSize:".85rem",
    color:"var(--text-muted)", marginTop:"6px",
  },
  statRow: { display:"flex", gap:"8px" },

  tableWrap: {
    background:"var(--card)",
    border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)",
    overflow:"hidden",
    boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
  },
  table: { width:"100%", borderCollapse:"collapse" },
  tr: {
    borderBottom:"1px solid var(--border)",
    transition:"background .12s",
    animation:"slideIn .3s ease both",
  },
  td: { padding:"13px 14px", verticalAlign:"middle" },
  patientName: {
    fontFamily:"var(--font-body)", fontSize:".85rem", color:"var(--text)",
  },
  dateText: {
    fontFamily:"var(--font-mono)", fontSize:".72rem", color:"var(--text-dim)",
  },
  badge: {
    fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".06em",
    padding:"3px 9px", borderRadius:"20px", border:"1px solid",
    background:"transparent",
  },
  conf:  { fontFamily:"var(--font-mono)", fontSize:".78rem", color:"var(--text)" },
  stage: { fontFamily:"var(--font-mono)", fontSize:".72rem", color:"var(--text-muted)" },
  time:  { fontFamily:"var(--font-mono)", fontSize:".68rem", color:"var(--text-muted)" },
  viewBtn: {
    padding:"5px 13px", borderRadius:"var(--r-sm)",
    border:"1px solid var(--border-hi)",
    background:"transparent", color:"var(--cyan)",
    fontFamily:"var(--font-body)", fontSize:".78rem",
    cursor:"pointer", transition:"background .12s",
  },
};

const sc = {
  chip: {
    display:"flex", flexDirection:"column", alignItems:"center",
    padding:"10px 18px",
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-lg)", gap:"3px",
    boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
  },
  val: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"1.2rem", letterSpacing:"-.01em",
  },
  lbl: {
    fontFamily:"var(--font-mono)", fontSize:".6rem",
    letterSpacing:".08em", color:"var(--text-muted)",
  },
};

const m = {
  overlay: {
    position:"fixed", inset:0, zIndex:200,
    background:"rgba(13,11,21,.75)", backdropFilter:"blur(6px)",
    display:"flex", alignItems:"center", justifyContent:"center",
    padding:"24px",
  },
  modal: {
    width:"100%", maxWidth:"640px", maxHeight:"85vh",
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)",
    overflow:"hidden auto",
    boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
    animation:"fadeUp .35s cubic-bezier(.16,1,.3,1) both",
  },
  modalHeader: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"18px 22px", borderBottom:"1px solid var(--border)",
    position:"sticky", top:0, background:"var(--card)", zIndex:1,
  },
  modalTitle: {
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".9rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  closeBtn: {
    background:"transparent", border:"1px solid var(--border)",
    borderRadius:"var(--r-sm)", color:"var(--text-muted)",
    width:"28px", height:"28px", cursor:"pointer",
    fontFamily:"var(--font-body)", fontSize:".82rem",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  body: {
    padding:"20px 22px",
    display:"flex", flexDirection:"column", gap:"18px",
  },
  section: { display:"flex", flexDirection:"column", gap:"10px" },
  sectionLabel: {
    fontFamily:"var(--font-mono)", fontSize:".6rem",
    letterSpacing:".14em", color:"var(--text-muted)",
  },
  heatmap: {
    width:"100%", borderRadius:"var(--r-md)",
    border:"1px solid var(--border)",
  },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" },
  reportText: {
    fontFamily:"var(--font-body)", fontSize:".83rem",
    color:"var(--text-dim)", lineHeight:1.72,
    whiteSpace:"pre-wrap",
    padding:"14px 16px",
    background:"var(--surface)",
    borderRadius:"var(--r-md)",
    border:"1px solid var(--border)",
  },
};
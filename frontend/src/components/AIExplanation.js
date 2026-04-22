import { useEffect, useState } from "react";

const CLINICAL_SECTIONS = ["FINDINGS","CONFIDENCE INTERPRETATION","EXPLAINABILITY INSIGHTS","CLINICAL RECOMMENDATION","DISCLAIMER"];
const PATIENT_SECTIONS  = ["WHAT WE FOUND","WHAT THIS MEANS FOR YOU","WHAT HAPPENS NEXT","IMPORTANT NOTE"];

function parseSections(text, keys) {
  if (!text) return null;
  const sections = [];
  for (let i = 0; i < keys.length; i++) {
    const start = text.indexOf(keys[i]);
    if (start === -1) continue;
    const after = start + keys[i].length;
    const nextPositions = keys.slice(i+1).map(k => text.indexOf(k, after)).filter(p => p !== -1);
    const end = nextPositions.length ? Math.min(...nextPositions) : text.length;
    sections.push({
      title: keys[i],
      body: text.slice(after, end).replace(/^\s*[:–\-\n]+/, "").trim(),
    });
  }
  return sections.length ? sections : null;
}

const SECTION_COLORS_CLINICAL = {
  "FINDINGS":                   "var(--cyan)",
  "CONFIDENCE INTERPRETATION":  "var(--indigo)",
  "EXPLAINABILITY INSIGHTS":    "var(--cyan)",
  "CLINICAL RECOMMENDATION":    "var(--green)",
  "DISCLAIMER":                 "var(--text-muted)",
};

const SECTION_COLORS_PATIENT = {
  "WHAT WE FOUND":            "var(--green)",
  "WHAT THIS MEANS FOR YOU":  "var(--cyan)",
  "WHAT HAPPENS NEXT":        "var(--indigo)",
  "IMPORTANT NOTE":           "var(--text-muted)",
};

export default function AIExplanation({ result, role }) {
  const isClinician = role === "clinician";
  const text = isClinician
    ? (result?.ai_explanation)
    : (result?.ai_explanation_patient || result?.ai_explanation);

  const sectionKeys   = isClinician ? CLINICAL_SECTIONS : PATIENT_SECTIONS;
  const sectionColors = isClinician ? SECTION_COLORS_CLINICAL : SECTION_COLORS_PATIENT;
  const sections = parseSections(text, sectionKeys);

  const [visible, setVisible] = useState([]);
  useEffect(() => {
    if (!sections) return;
    setVisible([]);
    sections.forEach((_, i) => setTimeout(() => setVisible(v => [...v, i]), i * 260));
  }, [text]);

  if (!text) return null;

  return (
    <div style={s.card} className="fadeUp-2">
      {/* Header */}
      <div style={{ ...s.header, background: isClinician
        ? "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, transparent 55%)"
        : "linear-gradient(135deg, rgba(244,114,182,0.07) 0%, transparent 55%)" }}>
        <div style={s.headerLeft}>
          <div style={{ ...s.icon, borderColor: isClinician ? "rgba(251,191,36,0.3)" : "rgba(244,114,182,0.3)",
            background: isClinician ? "rgba(251,191,36,0.08)" : "var(--cyan-glow)" }}>
            {isClinician
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            }
          </div>
          <div>
            <p style={s.title}>
              {isClinician ? "Clinical Report" : "Your Results Explained"}
            </p>
            <p style={s.sub}>
              {isClinician
                ? "AI-generated clinical narrative · Groq LLaMA-3 · For specialist review"
                : "Easy-to-understand summary of your eye scan · Reviewed by AI"}
            </p>
          </div>
        </div>
        <div style={s.rolePill}>
          <span style={{ ...s.pillDot, background: isClinician ? "var(--indigo)" : "var(--cyan)" }} />
          {isClinician ? "Clinician View" : "Patient View"}
        </div>
      </div>

      {/* Sections */}
      <div style={s.body}>
        {sections ? sections.map((sec, i) => (
          <div key={sec.title} style={{
            ...s.section,
            opacity:   visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? "translateY(0)" : "translateY(12px)",
            transition:"opacity .4s ease, transform .4s ease",
          }}>
            <div style={s.secHead}>
              <div style={{ ...s.secDot, background: sectionColors[sec.title] || "var(--cyan)" }} />
              <p style={{ ...s.secTitle, color: sectionColors[sec.title] || "var(--cyan)" }}>
                {sec.title}
              </p>
            </div>
            <p style={s.secBody}>{sec.body}</p>
          </div>
        )) : (
          <p style={s.rawText}>{text}</p>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        {isClinician
          ? "AI-generated — always confirm with clinical examination and specialist review."
          : "This is a screening tool. Please discuss these results with your doctor."}
      </div>
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
  headerLeft: { display:"flex", alignItems:"center", gap:"12px" },
  icon: {
    width:"34px", height:"34px", borderRadius:"var(--r-sm)",
    border:"1px solid",
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  title: {
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".88rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  sub: {
    fontFamily:"var(--font-mono)", fontSize:".62rem",
    color:"var(--text-muted)", marginTop:"3px", letterSpacing:".03em",
  },
  rolePill: {
    display:"flex", alignItems:"center", gap:"6px",
    padding:"4px 12px", borderRadius:"20px",
    border:"1px solid var(--border-hi)",
    background:"var(--surface)",
    fontFamily:"var(--font-mono)", fontSize:".65rem", color:"var(--text-dim)",
  },
  pillDot: { width:"6px", height:"6px", borderRadius:"50%" },

  body: { padding:"20px 22px", display:"flex", flexDirection:"column", gap:"18px" },
  section: { display:"flex", flexDirection:"column", gap:"8px" },
  secHead: { display:"flex", alignItems:"center", gap:"8px" },
  secDot:  { width:"6px", height:"6px", borderRadius:"50%", flexShrink:0 },
  secTitle: {
    fontFamily:"var(--font-mono)", fontSize:".65rem",
    letterSpacing:".12em", fontWeight:500,
  },
  secBody: {
    fontFamily:"var(--font-body)", fontSize:".83rem",
    color:"var(--text-dim)", lineHeight:1.72,
    paddingLeft:"14px",
    borderLeft:"1px solid var(--border)",
  },
  rawText: {
    fontFamily:"var(--font-body)", fontSize:".83rem",
    color:"var(--text-dim)", lineHeight:1.7, whiteSpace:"pre-wrap",
  },
  footer: {
    display:"flex", alignItems:"center", gap:"8px",
    padding:"10px 22px",
    borderTop:"1px solid var(--border)",
    background:"rgba(251,146,60,0.04)",
    fontFamily:"var(--font-mono)", fontSize:".67rem",
    color:"rgba(251,146,60,0.8)", lineHeight:1.5,
  },
};
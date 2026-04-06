import './ResultCard.css';
const META = {
  "No DR": { color:"var(--green)", short:"NDR", desc:"No diabetic retinopathy detected"       },
  "DR":    { color:"var(--amber)", short:"DR+", desc:"Diabetic retinopathy detected"          },
  "NDR":   { color:"var(--green)", short:"NDR", desc:"No Diabetic Retinopathy"               },
  "MDR":   { color:"var(--amber)", short:"MDR", desc:"Mild to Moderate Diabetic Retinopathy" },
  "PDR":   { color:"var(--rose)",  short:"PDR", desc:"Proliferative Diabetic Retinopathy"    },
};

function resolve(str) {
  if (!str) return null;
  for (const k of Object.keys(META)) if (str.includes(k)) return k;
  return str;
}

// SVG donut gauge — shows confidence %
function Gauge({ pct, color }) {
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const fill = circ * (pct / 100);
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Track */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      {/* Fill */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeDashoffset={circ * 0.25}   /* start at top */
        strokeLinecap="round"
        style={{ transition:"stroke-dasharray 1s cubic-bezier(.16,1,.3,1)", filter:`drop-shadow(0 0 6px ${color}66)` }}
      />
      {/* Label */}
      <text x="50" y="46" textAnchor="middle" fill={color} fontSize="14" fontFamily="var(--mono)" fontWeight="500">{pct.toFixed(0)}%</text>
      <text x="50" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--mono)">confidence</text>
    </svg>
  );
}

function SeverityBar({ label, color, active }) {
  return (
    <div style={{ ...s.sevItem, ...(active ? { borderColor:color, background:`${color}12` } : {}) }}>
      <div style={{ ...s.sevDot, background: active ? color : "var(--border-hi)", boxShadow: active ? `0 0 8px ${color}` : "none" }} />
      <span style={{ ...s.sevLabel, color: active ? color : "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

export default function ResultCard({ result }) {
  if (!result) return null;

  const binRaw  = result.binary_prediction     || "";
  const mulRaw  = result.multiclass_prediction || "";
  const conf    = typeof result.dr_confidence === "number" ? result.dr_confidence : null;
  const ms      = result.processing_time_ms;
  const isDR    = result.binary_label === 1;

  const binKey  = resolve(binRaw);
  const mulKey  = resolve(mulRaw);
  const binMeta = META[binKey]  || { color:"var(--sage)", short:binKey,  desc:binRaw  };
  const mulMeta = META[mulKey]  || { color:"var(--sage)", short:mulKey,  desc:mulRaw  };

  return (
    <div style={s.card}>
      {/* Top accent bar */}
      <div style={{ ...s.topBar, background: isDR
        ? "linear-gradient(90deg,rgba(252,211,77,.3),rgba(253,164,175,.2),transparent)"
        : "linear-gradient(90deg,rgba(110,231,183,.3),rgba(94,234,212,.2),transparent)"
      }} />

      <div style={s.body}>
        {/* Gauge */}
        <div style={s.gaugeCol}>
          {conf !== null && <Gauge pct={conf} color={binMeta.color} />}
          <div style={{ ...s.verdictBadge, borderColor:binMeta.color, color:binMeta.color }}>
            {binMeta.short}
          </div>
        </div>

        {/* Info */}
        <div style={s.infoCol}>
          <p style={{ ...s.mainLabel, color:binMeta.color }}>{binKey || binRaw}</p>
          <p style={s.mainDesc}>{binMeta.desc}</p>

          <div style={s.divider} />

          {/* Severity progression */}
          <p style={s.micro}>SEVERITY GRADE</p>
          <div style={s.sevRow}>
            <SeverityBar label="NDR" color="var(--green)" active={mulKey === "NDR" || mulKey === "No DR"} />
            <div style={s.sevArrow}>→</div>
            <SeverityBar label="MDR" color="var(--amber)" active={mulKey === "MDR"} />
            <div style={s.sevArrow}>→</div>
            <SeverityBar label="PDR" color="var(--rose)"  active={mulKey === "PDR"} />
          </div>
          <p style={{ ...s.sevDesc, color:mulMeta.color }}>{mulMeta.desc}</p>
        </div>
      </div>

      {/* Meta strip */}
      <div style={s.metaStrip}>
        {[
          ["Patient", result.patient_id],
          ["APTOS Stage", `${result.stage_guess} / 4`],
          ["Inference", ms != null ? `${(ms/1000).toFixed(1)}s` : "—"],
          ["Referral", isDR ? "Recommended" : "Not required"],
        ].map(([k, v]) => (
          <div key={k} style={s.metaCell}>
            <span style={s.metaKey}>{k}</span>
            <span style={{ ...s.metaVal, color: k==="Referral" ? (isDR ? "var(--amber)" : "var(--green)") : "var(--text)" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: {
    background:"var(--card)", border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", overflow:"hidden",
    boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
    animation:"fadeUp .5s cubic-bezier(.16,1,.3,1) both",
  },
  topBar: { height:"3px" },
  body: { display:"flex", gap:"20px", padding:"22px 22px 16px", alignItems:"flex-start" },
  gaugeCol: { display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", flexShrink:0 },
  verdictBadge: {
    fontFamily:"var(--mono)", fontWeight:500, fontSize:".75rem",
    letterSpacing:".08em", padding:"3px 12px",
    borderRadius:"20px", border:"1.5px solid", background:"var(--surface)",
  },
  infoCol: { flex:1, display:"flex", flexDirection:"column", gap:"10px", minWidth:0 },
  mainLabel: { fontFamily:"var(--serif)", fontSize:"1.3rem", lineHeight:1.2, letterSpacing:"-.01em" },
  mainDesc:  { fontFamily:"var(--sans)", fontSize:".82rem", color:"var(--text-dim)", lineHeight:1.5 },
  divider:   { height:"1px", background:"var(--border)", margin:"2px 0" },
  micro:     { fontFamily:"var(--mono)", fontSize:".58rem", letterSpacing:".14em", color:"var(--text-muted)" },
  sevRow:    { display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" },
  sevItem: {
    display:"flex", alignItems:"center", gap:"6px",
    padding:"5px 10px", borderRadius:"20px",
    border:"1px solid var(--border)", background:"var(--surface)",
    transition:"all .3s ease",
  },
  sevDot:   { width:"7px", height:"7px", borderRadius:"50%", flexShrink:0, transition:"all .3s ease" },
  sevLabel: { fontFamily:"var(--mono)", fontSize:".7rem", fontWeight:500, transition:"color .3s" },
  sevArrow: { color:"var(--text-muted)", fontFamily:"var(--mono)", fontSize:".7rem" },
  sevDesc:  { fontFamily:"var(--sans)", fontSize:".78rem", lineHeight:1.4 },

  metaStrip: { display:"flex", borderTop:"1px solid var(--border)" },
  metaCell: {
    flex:1, display:"flex", flexDirection:"column", gap:"3px",
    padding:"10px 16px", borderRight:"1px solid var(--border)",
  },
  metaKey: { fontFamily:"var(--mono)", fontSize:".57rem", letterSpacing:".1em", color:"var(--text-muted)", textTransform:"uppercase" },
  metaVal: { fontFamily:"var(--mono)", fontSize:".78rem", fontWeight:500 },
};
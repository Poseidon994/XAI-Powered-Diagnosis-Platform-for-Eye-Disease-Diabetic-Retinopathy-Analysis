// import { useState } from "react";
// import RotatingFact from "../components/RotatingFact";

// const API = "http://localhost:5000";

// export default function LoginPage({ onAuth }) {
//   const [mode,    setMode]    = useState("login");
//   const [role,    setRole]    = useState("patient");
//   const [form,    setForm]    = useState({ name:"", email:"", password:"" });
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState(null);

//   const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const submit = async () => {
//     setError(null); setLoading(true);
//     try {
//       const body = mode === "register"
//         ? { name:form.name, email:form.email, password:form.password, role }
//         : { email:form.email, password:form.password, role };

//       const res  = await fetch(`${API}/api/auth/${mode}`, {
//         method:"POST",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify(body),
//       });
//       const json = await res.json();
//       if (!json.success) throw new Error(json.error);

//       localStorage.setItem("ocula_token", json.token);
//       localStorage.setItem("ocula_user",  JSON.stringify(json.user));
//       onAuth(json.user, json.token);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKey = (e) => { if (e.key === "Enter") submit(); };

//   return (
//     <div style={s.root}>
//       {/* Decorative blobs */}
//       <div style={s.blob1} />
//       <div style={s.blob2} />
//       <div style={s.blob3} />

//       {/* Left panel — branding + facts */}
//       <div style={s.leftPanel} className="z1">
//         <div style={s.brandBlock}>
//           <div style={s.eyeLogo}>
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
//               stroke="var(--cyan)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//               <circle cx="12" cy="12" r="3"/>
//             </svg>
//           </div>
//           <div>
//             <p style={s.brandName}>OCU<span style={s.brandAccent}>LA</span></p>
//             <p style={s.brandTagline}>See clearly. Act early.</p>
//           </div>
//         </div>

//         <div style={s.heroText}>
//           <h1 style={s.heroTitle}>AI-Powered<br />Diabetic Retinopathy<br />Screening</h1>
//           <p style={s.heroDesc}>
//             Combining five CNN backbones, ensemble learning, and explainable AI
//             to detect and grade diabetic retinopathy with clinical-grade accuracy.
//           </p>
//         </div>

//         <div style={s.statsRow}>
//           {[["98.50%","Binary Accuracy"],["90.68%","Multiclass Acc."],["5","CNN Backbones"],["8×","TTA Views"]].map(([v,l])=>(
//             <div key={l} style={s.stat}>
//               <span style={s.statVal}>{v}</span>
//               <span style={s.statLabel}>{l}</span>
//             </div>
//           ))}
//         </div>

//         <div style={s.factBox}>
//           <RotatingFact />
//         </div>
//       </div>

//       {/* Right panel — auth form */}
//       <div style={s.rightPanel} className="z1">
//         <div style={s.card}>
//           {/* Mobile logo */}
//           <div style={s.mobileLogo}>
//             <div style={s.eyeLogo}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
//                 stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//                 <circle cx="12" cy="12" r="3"/>
//               </svg>
//             </div>
//             <span style={s.mobileLogoText}>OCU<span style={s.brandAccent}>LA</span></span>
//           </div>

//           <p style={s.cardTitle}>{mode === "login" ? "Welcome back" : "Create account"}</p>
//           <p style={s.cardSub}>
//             {mode === "login"
//               ? "Sign in to access your DR screening dashboard."
//               : "Register to start screening and tracking results."}
//           </p>

//           {/* Mode toggle */}
//           <div style={s.modeRow}>
//             {["login","register"].map(m => (
//               <button key={m}
//                 style={{ ...s.modeBtn, ...(mode===m ? s.modeBtnActive:{}) }}
//                 onClick={() => { setMode(m); setError(null); }}>
//                 {m === "login" ? "Sign In" : "Register"}
//               </button>
//             ))}
//           </div>

//           {/* Role selector */}
//           <div style={s.roleRow}>
//             <p style={s.roleLabel}>I am a</p>
//             <div style={s.roleBtns}>
//               {[["patient","Patient"],["clinician","Clinician / Doctor"]].map(([r,l])=>(
//                 <button key={r}
//                   style={{ ...s.roleBtn, ...(role===r ? s.roleBtnActive:{}) }}
//                   onClick={() => setRole(r)}>
//                   {r === "patient"
//                     ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
//                     : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
//                   }
//                   {l}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Fields */}
//           <div style={s.fields}>
//             {mode === "register" && (
//               <Field label="Full Name" type="text" value={form.name}
//                 onChange={v=>update("name",v)} placeholder="Dr. Jane Smith" onKey={handleKey} />
//             )}
//             <Field label="Email Address" type="email" value={form.email}
//               onChange={v=>update("email",v)} placeholder="you@hospital.org" onKey={handleKey} />
//             <Field label="Password" type="password" value={form.password}
//               onChange={v=>update("password",v)}
//               placeholder={mode==="register" ? "Min. 6 characters" : "••••••••"} onKey={handleKey} />
//           </div>

//           {error && <div style={s.errorBox}>{error}</div>}

//           <button style={s.submitBtn} onClick={submit} disabled={loading}>
//             {loading
//               ? <span style={s.spinner} />
//               : (mode==="login" ? "Sign In →" : "Create Account →")}
//           </button>

//           <p style={s.switchText}>
//             {mode==="login" ? "New to Ocula? " : "Already have an account? "}
//             <span style={s.switchLink}
//               onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(null); }}>
//               {mode==="login" ? "Register" : "Sign In"}
//             </span>
//           </p>
//         </div>

//         <p style={s.footerNote}>Research use only · Not a certified medical device</p>
//       </div>
//     </div>
//   );
// }

// function Field({ label, type, value, onChange, placeholder, onKey }) {
//   return (
//     <div style={f.wrap}>
//       <label style={f.label}>{label}</label>
//       <input type={type} value={value} placeholder={placeholder}
//         onChange={e=>onChange(e.target.value)} onKeyDown={onKey} style={f.input} />
//     </div>
//   );
// }

// /* ── Styles ──────────────────────────────────────────────────────── */
// const s = {
//   root: {
//     minHeight:"100vh", display:"grid",
//     gridTemplateColumns:"1fr 480px",
//     position:"relative", overflow:"hidden",
//   },

//   /* Blobs */
//   blob1: {
//     position:"fixed", top:"-15%", left:"-8%",
//     width:"520px", height:"520px", borderRadius:"50%",
//     background:"radial-gradient(ellipse, rgba(244,114,182,0.09) 0%, transparent 70%)",
//     pointerEvents:"none",
//   },
//   blob2: {
//     position:"fixed", bottom:"-20%", right:"-5%",
//     width:"600px", height:"600px", borderRadius:"50%",
//     background:"radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)",
//     pointerEvents:"none",
//   },
//   blob3: {
//     position:"fixed", top:"40%", left:"30%",
//     width:"400px", height:"400px", borderRadius:"50%",
//     background:"radial-gradient(ellipse, rgba(196,181,253,0.04) 0%, transparent 70%)",
//     pointerEvents:"none",
//   },

//   /* Left panel */
//   leftPanel: {
//     padding:"60px 64px",
//     display:"flex", flexDirection:"column", gap:"48px",
//     justifyContent:"center",
//   },
//   brandBlock: { display:"flex", alignItems:"center", gap:"14px" },
//   eyeLogo: {
//     width:"48px", height:"48px", borderRadius:"var(--r-md)",
//     background:"var(--cyan-glow)",
//     border:"1px solid rgba(244,114,182,0.3)",
//     display:"flex", alignItems:"center", justifyContent:"center",
//     boxShadow:"0 0 24px rgba(244,114,182,0.15)", flexShrink:0,
//   },
//   brandName: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"1.6rem", color:"var(--text)", letterSpacing:".06em",
//   },
//   brandAccent: { color:"var(--cyan)" },
//   brandTagline: {
//     fontFamily:"var(--font-mono)", fontSize:".7rem",
//     color:"var(--text-muted)", letterSpacing:".1em", marginTop:"2px",
//   },
//   heroText: { display:"flex", flexDirection:"column", gap:"16px" },
//   heroTitle: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"clamp(1.6rem,3vw,2.4rem)",
//     color:"var(--text)", lineHeight:1.15, letterSpacing:"-.02em",
//   },
//   heroDesc: {
//     fontFamily:"var(--font-body)", fontSize:".92rem",
//     color:"var(--text-dim)", lineHeight:1.7, maxWidth:"460px",
//   },
//   statsRow: {
//     display:"flex", gap:"24px", flexWrap:"wrap",
//   },
//   stat: { display:"flex", flexDirection:"column", gap:"4px" },
//   statVal: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"1.3rem", color:"var(--cyan)", letterSpacing:"-.01em",
//   },
//   statLabel: {
//     fontFamily:"var(--font-mono)", fontSize:".6rem",
//     color:"var(--text-muted)", letterSpacing:".08em",
//   },
//   factBox: {
//     padding:"20px 0 0",
//     borderTop:"1px solid var(--border)",
//   },

//   /* Right panel */
//   rightPanel: {
//     background:"var(--surface)",
//     borderLeft:"1px solid var(--border)",
//     display:"flex", flexDirection:"column",
//     alignItems:"center", justifyContent:"center",
//     padding:"40px 36px", gap:"20px",
//     minHeight:"100vh",
//   },
//   card: {
//     width:"100%", maxWidth:"380px",
//     background:"var(--card)",
//     border:"1px solid var(--border-hi)",
//     borderRadius:"var(--r-xl)", padding:"32px 28px",
//     display:"flex", flexDirection:"column", gap:"18px",
//     boxShadow:"0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(244,114,182,0.05)",
//     animation:"fadeUp .5s cubic-bezier(.16,1,.3,1) both",
//   },
//   mobileLogo: {
//     display:"flex", alignItems:"center", gap:"10px",
//     paddingBottom:"4px",
//   },
//   mobileLogoText: {
//     fontFamily:"var(--font-display)", fontWeight:700,
//     fontSize:"1.1rem", color:"var(--text)", letterSpacing:".06em",
//   },
//   cardTitle: {
//     fontFamily:"var(--font-display)", fontWeight:600,
//     fontSize:"1.1rem", color:"var(--text)", letterSpacing:"-.01em",
//   },
//   cardSub: {
//     fontFamily:"var(--font-body)", fontSize:".82rem",
//     color:"var(--text-muted)", lineHeight:1.55, marginTop:"-6px",
//   },
//   modeRow: {
//     display:"flex", gap:"4px",
//     background:"var(--surface)", borderRadius:"var(--r-md)", padding:"4px",
//   },
//   modeBtn: {
//     flex:1, padding:"8px", borderRadius:"var(--r-sm)", border:"none",
//     background:"transparent", color:"var(--text-muted)",
//     fontFamily:"var(--font-body)", fontSize:".82rem",
//     cursor:"pointer", transition:"background .15s, color .15s",
//   },
//   modeBtnActive: {
//     background:"var(--card-hi)", color:"var(--cyan)",
//     boxShadow:"0 1px 6px rgba(0,0,0,0.3)",
//   },
//   roleLabel: {
//     fontFamily:"var(--font-mono)", fontSize:".65rem",
//     letterSpacing:".1em", color:"var(--text-muted)",
//   },
//   roleRow: { display:"flex", flexDirection:"column", gap:"8px" },
//   roleBtns: { display:"flex", gap:"8px" },
//   roleBtn: {
//     flex:1, display:"flex", alignItems:"center", justifyContent:"center",
//     gap:"7px", padding:"9px",
//     borderRadius:"var(--r-md)", border:"1px solid var(--border)",
//     background:"transparent", color:"var(--text-muted)",
//     fontFamily:"var(--font-body)", fontSize:".8rem",
//     cursor:"pointer", transition:"border-color .15s, color .15s, background .15s",
//   },
//   roleBtnActive: {
//     borderColor:"var(--cyan)", color:"var(--cyan)",
//     background:"var(--cyan-glow)",
//   },
//   fields: { display:"flex", flexDirection:"column", gap:"13px" },
//   errorBox: {
//     padding:"10px 14px", borderRadius:"var(--r-sm)",
//     background:"rgba(248,113,113,0.08)",
//     border:"1px solid rgba(248,113,113,0.3)",
//     color:"var(--red)",
//     fontFamily:"var(--font-mono)", fontSize:".75rem", lineHeight:1.5,
//   },
//   submitBtn: {
//     width:"100%", padding:"13px",
//     borderRadius:"var(--r-md)", border:"none",
//     background:"var(--cyan)", color:"var(--bg)",
//     fontFamily:"var(--font-display)", fontWeight:600,
//     fontSize:".82rem", letterSpacing:".04em", cursor:"pointer",
//     boxShadow:"0 4px 20px rgba(244,114,182,0.3)",
//     display:"flex", alignItems:"center", justifyContent:"center",
//     minHeight:"46px",
//   },
//   spinner: {
//     width:"16px", height:"16px", borderRadius:"50%",
//     border:"2px solid rgba(13,11,21,.3)", borderTopColor:"var(--bg)",
//     animation:"spin .7s linear infinite", display:"inline-block",
//   },
//   switchText: {
//     fontFamily:"var(--font-body)", fontSize:".8rem",
//     color:"var(--text-muted)", textAlign:"center",
//   },
//   switchLink: {
//     color:"var(--cyan)", cursor:"pointer",
//     textDecoration:"underline", textUnderlineOffset:"3px",
//   },
//   footerNote: {
//     fontFamily:"var(--font-mono)", fontSize:".62rem",
//     color:"var(--text-muted)", letterSpacing:".04em", textAlign:"center",
//   },
// };

// const f = {
//   wrap: { display:"flex", flexDirection:"column", gap:"6px" },
//   label: {
//     fontFamily:"var(--font-mono)", fontSize:".65rem",
//     letterSpacing:".1em", color:"var(--text-muted)",
//   },
//   input: {
//     padding:"10px 13px", borderRadius:"var(--r-md)",
//     border:"1px solid var(--border-hi)",
//     background:"var(--surface)", color:"var(--text)",
//     fontFamily:"var(--font-body)", fontSize:".88rem",
//     outline:"none", width:"100%",
//   },
// };
import { useState } from "react";
import RotatingFact from "../components/RotatingFact";
import API_URL from "../config";

const API = API_URL;

export default function LoginPage({ onAuth }) {
  const [mode,    setMode]    = useState("login");
  const [role,    setRole]    = useState("patient");
  const [form,    setForm]    = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      const body = mode === "register"
        ? { name:form.name, email:form.email, password:form.password, role }
        : { email:form.email, password:form.password, role };

      const res  = await fetch(`${API}/api/auth/${mode}`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      localStorage.setItem("ocula_token", json.token);
      localStorage.setItem("ocula_user",  JSON.stringify(json.user));
      onAuth(json.user, json.token);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div style={s.root}>
      {/* Decorative blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      {/* Left panel — branding + facts */}
      <div style={s.leftPanel} className="z1">
        <div style={s.brandBlock}>
          <div style={s.eyeLogo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="var(--cyan)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <p style={s.brandName}>OCU<span style={s.brandAccent}>LA</span></p>
            <p style={s.brandTagline}>See clearly. Act early.</p>
          </div>
        </div>

        <div style={s.heroText}>
          <h1 style={s.heroTitle}>AI-Powered<br />Diabetic Retinopathy<br />Screening</h1>
          <p style={s.heroDesc}>
            Combining five CNN backbones, ensemble learning, and explainable AI
            to detect and grade diabetic retinopathy with clinical-grade accuracy.
          </p>
        </div>

        <div style={s.statsRow}>
          {[["98.50%","Binary Accuracy"],["90.68%","Multiclass Acc."],["5","CNN Backbones"],["8×","TTA Views"]].map(([v,l])=>(
            <div key={l} style={s.stat}>
              <span style={s.statVal}>{v}</span>
              <span style={s.statLabel}>{l}</span>
            </div>
          ))}
        </div>

        <div style={s.factBox}>
          <RotatingFact />
        </div>
      </div>

      {/* Right panel — auth form */}
      <div style={s.rightPanel} className="z1">
        <div style={s.card}>
          {/* Mobile logo */}
          <div style={s.mobileLogo}>
            <div style={s.eyeLogo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span style={s.mobileLogoText}>OCU<span style={s.brandAccent}>LA</span></span>
          </div>

          <p style={s.cardTitle}>{mode === "login" ? "Welcome back" : "Create account"}</p>
          <p style={s.cardSub}>
            {mode === "login"
              ? "Sign in to access your DR screening dashboard."
              : "Register to start screening and tracking results."}
          </p>

          {/* Mode toggle */}
          <div style={s.modeRow}>
            {["login","register"].map(m => (
              <button key={m}
                style={{ ...s.modeBtn, ...(mode===m ? s.modeBtnActive:{}) }}
                onClick={() => { setMode(m); setError(null); }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div style={s.roleRow}>
            <p style={s.roleLabel}>I am a</p>
            <div style={s.roleBtns}>
              {[["patient","Patient"],["clinician","Clinician / Doctor"]].map(([r,l])=>(
                <button key={r}
                  style={{ ...s.roleBtn, ...(role===r ? s.roleBtnActive:{}) }}
                  onClick={() => setRole(r)}>
                  {r === "patient"
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  }
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div style={s.fields}>
            {mode === "register" && (
              <Field label="Full Name" type="text" value={form.name}
                onChange={v=>update("name",v)} placeholder="Dr. Jane Smith" onKey={handleKey} />
            )}
            <Field label="Email Address" type="email" value={form.email}
              onChange={v=>update("email",v)} placeholder="you@hospital.org" onKey={handleKey} />
            <Field label="Password" type="password" value={form.password}
              onChange={v=>update("password",v)}
              placeholder={mode==="register" ? "Min. 6 characters" : "••••••••"} onKey={handleKey} />
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <button style={s.submitBtn} onClick={submit} disabled={loading}>
            {loading
              ? <span style={s.spinner} />
              : (mode==="login" ? "Sign In →" : "Create Account →")}
          </button>

          <p style={s.switchText}>
            {mode==="login" ? "New to Ocula? " : "Already have an account? "}
            <span style={s.switchLink}
              onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(null); }}>
              {mode==="login" ? "Register" : "Sign In"}
            </span>
          </p>
        </div>

        <p style={s.footerNote}>Research use only · Not a certified medical device</p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, onKey }) {
  return (
    <div style={f.wrap}>
      <label style={f.label}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e=>onChange(e.target.value)} onKeyDown={onKey} style={f.input} />
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight:"100vh", display:"grid",
    gridTemplateColumns:"1fr 480px",
    position:"relative", overflow:"hidden",
  },

  /* Blobs */
  blob1: {
    position:"fixed", top:"-15%", left:"-8%",
    width:"520px", height:"520px", borderRadius:"50%",
    background:"radial-gradient(ellipse, rgba(244,114,182,0.09) 0%, transparent 70%)",
    pointerEvents:"none",
  },
  blob2: {
    position:"fixed", bottom:"-20%", right:"-5%",
    width:"600px", height:"600px", borderRadius:"50%",
    background:"radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)",
    pointerEvents:"none",
  },
  blob3: {
    position:"fixed", top:"40%", left:"30%",
    width:"400px", height:"400px", borderRadius:"50%",
    background:"radial-gradient(ellipse, rgba(196,181,253,0.04) 0%, transparent 70%)",
    pointerEvents:"none",
  },

  /* Left panel */
  leftPanel: {
    padding:"60px 64px",
    display:"flex", flexDirection:"column", gap:"48px",
    justifyContent:"center",
  },
  brandBlock: { display:"flex", alignItems:"center", gap:"14px" },
  eyeLogo: {
    width:"48px", height:"48px", borderRadius:"var(--r-md)",
    background:"var(--cyan-glow)",
    border:"1px solid rgba(244,114,182,0.3)",
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:"0 0 24px rgba(244,114,182,0.15)", flexShrink:0,
  },
  brandName: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"1.6rem", color:"var(--text)", letterSpacing:".06em",
  },
  brandAccent: { color:"var(--cyan)" },
  brandTagline: {
    fontFamily:"var(--font-mono)", fontSize:".7rem",
    color:"var(--text-muted)", letterSpacing:".1em", marginTop:"2px",
  },
  heroText: { display:"flex", flexDirection:"column", gap:"16px" },
  heroTitle: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"clamp(1.6rem,3vw,2.4rem)",
    color:"var(--text)", lineHeight:1.15, letterSpacing:"-.02em",
  },
  heroDesc: {
    fontFamily:"var(--font-body)", fontSize:".92rem",
    color:"var(--text-dim)", lineHeight:1.7, maxWidth:"460px",
  },
  statsRow: {
    display:"flex", gap:"24px", flexWrap:"wrap",
  },
  stat: { display:"flex", flexDirection:"column", gap:"4px" },
  statVal: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"1.3rem", color:"var(--cyan)", letterSpacing:"-.01em",
  },
  statLabel: {
    fontFamily:"var(--font-mono)", fontSize:".6rem",
    color:"var(--text-muted)", letterSpacing:".08em",
  },
  factBox: {
    padding:"20px 0 0",
    borderTop:"1px solid var(--border)",
  },

  /* Right panel */
  rightPanel: {
    background:"var(--surface)",
    borderLeft:"1px solid var(--border)",
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    padding:"40px 36px", gap:"20px",
    minHeight:"100vh",
  },
  card: {
    width:"100%", maxWidth:"380px",
    background:"var(--card)",
    border:"1px solid var(--border-hi)",
    borderRadius:"var(--r-xl)", padding:"32px 28px",
    display:"flex", flexDirection:"column", gap:"18px",
    boxShadow:"0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(244,114,182,0.05)",
    animation:"fadeUp .5s cubic-bezier(.16,1,.3,1) both",
  },
  mobileLogo: {
    display:"flex", alignItems:"center", gap:"10px",
    paddingBottom:"4px",
  },
  mobileLogoText: {
    fontFamily:"var(--font-display)", fontWeight:700,
    fontSize:"1.1rem", color:"var(--text)", letterSpacing:".06em",
  },
  cardTitle: {
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:"1.1rem", color:"var(--text)", letterSpacing:"-.01em",
  },
  cardSub: {
    fontFamily:"var(--font-body)", fontSize:".82rem",
    color:"var(--text-muted)", lineHeight:1.55, marginTop:"-6px",
  },
  modeRow: {
    display:"flex", gap:"4px",
    background:"var(--surface)", borderRadius:"var(--r-md)", padding:"4px",
  },
  modeBtn: {
    flex:1, padding:"8px", borderRadius:"var(--r-sm)", border:"none",
    background:"transparent", color:"var(--text-muted)",
    fontFamily:"var(--font-body)", fontSize:".82rem",
    cursor:"pointer", transition:"background .15s, color .15s",
  },
  modeBtnActive: {
    background:"var(--card-hi)", color:"var(--cyan)",
    boxShadow:"0 1px 6px rgba(0,0,0,0.3)",
  },
  roleLabel: {
    fontFamily:"var(--font-mono)", fontSize:".65rem",
    letterSpacing:".1em", color:"var(--text-muted)",
  },
  roleRow: { display:"flex", flexDirection:"column", gap:"8px" },
  roleBtns: { display:"flex", gap:"8px" },
  roleBtn: {
    flex:1, display:"flex", alignItems:"center", justifyContent:"center",
    gap:"7px", padding:"9px",
    borderRadius:"var(--r-md)", border:"1px solid var(--border)",
    background:"transparent", color:"var(--text-muted)",
    fontFamily:"var(--font-body)", fontSize:".8rem",
    cursor:"pointer", transition:"border-color .15s, color .15s, background .15s",
  },
  roleBtnActive: {
    borderColor:"var(--cyan)", color:"var(--cyan)",
    background:"var(--cyan-glow)",
  },
  fields: { display:"flex", flexDirection:"column", gap:"13px" },
  errorBox: {
    padding:"10px 14px", borderRadius:"var(--r-sm)",
    background:"rgba(248,113,113,0.08)",
    border:"1px solid rgba(248,113,113,0.3)",
    color:"var(--red)",
    fontFamily:"var(--font-mono)", fontSize:".75rem", lineHeight:1.5,
  },
  submitBtn: {
    width:"100%", padding:"13px",
    borderRadius:"var(--r-md)", border:"none",
    background:"var(--cyan)", color:"var(--bg)",
    fontFamily:"var(--font-display)", fontWeight:600,
    fontSize:".82rem", letterSpacing:".04em", cursor:"pointer",
    boxShadow:"0 4px 20px rgba(244,114,182,0.3)",
    display:"flex", alignItems:"center", justifyContent:"center",
    minHeight:"46px",
  },
  spinner: {
    width:"16px", height:"16px", borderRadius:"50%",
    border:"2px solid rgba(13,11,21,.3)", borderTopColor:"var(--bg)",
    animation:"spin .7s linear infinite", display:"inline-block",
  },
  switchText: {
    fontFamily:"var(--font-body)", fontSize:".8rem",
    color:"var(--text-muted)", textAlign:"center",
  },
  switchLink: {
    color:"var(--cyan)", cursor:"pointer",
    textDecoration:"underline", textUnderlineOffset:"3px",
  },
  footerNote: {
    fontFamily:"var(--font-mono)", fontSize:".62rem",
    color:"var(--text-muted)", letterSpacing:".04em", textAlign:"center",
  },
};

const f = {
  wrap: { display:"flex", flexDirection:"column", gap:"6px" },
  label: {
    fontFamily:"var(--font-mono)", fontSize:".65rem",
    letterSpacing:".1em", color:"var(--text-muted)",
  },
  input: {
    padding:"10px 13px", borderRadius:"var(--r-md)",
    border:"1px solid var(--border-hi)",
    background:"var(--surface)", color:"var(--text)",
    fontFamily:"var(--font-body)", fontSize:".88rem",
    outline:"none", width:"100%",
  },
};
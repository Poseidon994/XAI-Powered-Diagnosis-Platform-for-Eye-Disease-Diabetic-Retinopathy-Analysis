import { useState, useEffect } from "react";

const FACTS = [
  { text: "The human eye can distinguish approximately 10 million different colours.", tag: "Eye Science" },
  { text: "Diabetic retinopathy is the leading cause of blindness in working-age adults worldwide.", tag: "DR Fact" },
  { text: "Over 537 million adults live with diabetes globally — a number expected to rise to 783 million by 2045.", tag: "Diabetes" },
  { text: "Early detection of diabetic retinopathy can prevent up to 95% of vision loss cases.", tag: "Prevention" },
  { text: "The retina contains over 120 million rod cells for night vision and 6 million cone cells for colour.", tag: "Eye Science" },
  { text: "Nearly 1 in 3 people with diabetes will develop some degree of diabetic retinopathy in their lifetime.", tag: "DR Fact" },
  { text: "AI-assisted DR screening achieves comparable diagnostic accuracy to specialist ophthalmologists.", tag: "AI & Medicine" },
  { text: "The eye is the only organ where blood vessels can be directly observed without surgery.", tag: "Eye Science" },
  { text: "Type 2 diabetes accounts for around 90–95% of all diabetes cases globally.", tag: "Diabetes" },
  { text: "Proliferative diabetic retinopathy, the most severe stage, affects approximately 5% of people with diabetes.", tag: "DR Fact" },
  { text: "Regular fundus photography can detect DR signs years before symptoms appear.", tag: "Prevention" },
  { text: "The optic disc — the 'blind spot' — has no photoreceptors at all.", tag: "Eye Science" },
  { text: "Uncontrolled blood sugar can damage retinal blood vessels in as little as 5 years.", tag: "Diabetes" },
  { text: "Grad-CAM heatmaps reveal which retinal regions deep learning models focus on during classification.", tag: "AI & Medicine" },
  { text: "The macula, responsible for central vision, covers only 5mm² of the retina.", tag: "Eye Science" },
];

const TAG_COLORS = {
  "Eye Science":  "var(--cyan)",
  "DR Fact":      "var(--red)",
  "Diabetes":     "var(--amber)",
  "Prevention":   "var(--green)",
  "AI & Medicine":"var(--indigo)",
};

export default function RotatingFact() {
  const [idx,     setIdx]     = useState(() => Math.floor(Math.random() * FACTS.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % FACTS.length);
        setVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fact  = FACTS[idx];
  const color = TAG_COLORS[fact.tag] || "var(--cyan)";

  return (
    <div style={{
      ...s.wrap,
      opacity:   visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(6px)",
    }}>
      <div style={{ ...s.tag, color, borderColor: color }}>
        {fact.tag}
      </div>
      <p style={s.text}>"{fact.text}"</p>
    </div>
  );
}

const s = {
  wrap: {
    display:"flex", flexDirection:"column", alignItems:"center",
    gap:"10px", padding:"0 16px",
    transition:"opacity .5s ease, transform .5s ease",
  },
  tag: {
    fontFamily:"var(--font-mono)", fontSize:".62rem",
    letterSpacing:".12em", textTransform:"uppercase",
    padding:"3px 10px", borderRadius:"20px",
    border:"1px solid", background:"transparent",
  },
  text: {
    fontFamily:"var(--font-body)", fontStyle:"italic",
    fontSize:".88rem", color:"var(--text-dim)",
    lineHeight:1.65, textAlign:"center",
    maxWidth:"540px",
  },
};
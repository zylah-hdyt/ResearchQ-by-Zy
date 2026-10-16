// ResearchQ Skills Library — 9 systems, 44 skills (source: ResearchQ_Library_Skills.pdf, pages 3–6 & 66).
export type Sys = { name: string; verb: string; role: string; tag: string; field: string; color: string; skills: string[] };

export const SYSTEMS: Sys[] = [
  { name: "GENESIS", verb: "DISCOVER", role: "Research Explorer", tag: "Find what to research.", field: "Alur skripsi & tesis", color: "#2453E8", skills: ["Judul Generator", "Gap Finder", "Scopus Finder", "Problem Master"] },
  { name: "CATALYST", verb: "DESIGN", role: "Research Architect", tag: "Design how to research.", field: "Kuantitatif & kualitatif", color: "#16A34A", skills: ["Hipotesis Checker", "Theory Master", "Method Master", "Kuesioner Builder", "Inquiry Architect"] },
  { name: "NEXUS", verb: "ANALYZE", role: "Research Analyst", tag: "Turn output into findings.", field: "Olah data & BAB 4", color: "#7C3AED", skills: ["SPSS Doctor", "SmartPLS Doctor", "BAB 4 Writer", "Humanizer", "Pattern Coder", "Trust Validator"] },
  { name: "ORACLE", verb: "FINISH", role: "Research Mentor", tag: "Review, revise, defend.", field: "Review, revisi & sidang", color: "#EA8A00", skills: ["Pembimbing Simulator", "Master Reviewer", "Auto Revision", "Paraphrase Akademik", "Anti AI Detection"] },
  { name: "KERNEL", verb: "ENGINEER", role: "Research Engineer", tag: "Design it. Test it. Prove it works.", field: "Informatika · SI · Ilkom", color: "#0E9FBF", skills: ["Scaffold Designer", "Sandbox Tester", "Benchmark Analyzer", "Delta Comparator", "Changelog Writer"] },
  { name: "VERDICT", verb: "ADJUDICATE", role: "Research Counsel", tag: "Where argument becomes verdict.", field: "Ilmu Hukum", color: "#4F46E5", skills: ["Statute Scanner", "Doctrine Builder", "Method Curator", "Verdict Reader", "Reasoning Architect"] },
  { name: "SPIRAL", verb: "REFLECT", role: "Research Practitioner", tag: "Plan it. Act it. Reflect on it.", field: "Penelitian Tindakan Kelas", color: "#E5398A", skills: ["Strategy Selector", "Cycle Designer", "Cycle Analyzer", "Reflection Writer"] },
  { name: "VITALS", verb: "VALIDATE", role: "Research Clinician", tag: "From symptom to significance.", field: "Kesehatan & Kedokteran", color: "#2F7FD0", skills: ["Design Selector", "Power Calculator", "Biostatistics Doctor", "PRISMA Reviewer"] },
  { name: "PRISM", verb: "PUBLISH", role: "The Research Publisher", tag: "From zero to publication.", field: "Publikasi jurnal", color: "#E11D2E", skills: ["Journal Matcher", "Manuscript Architect", "Article Converter", "Abstract Master", "Citation", "Rebuttal Letter"] },
];

// Lighten a hex colour toward white (for legible accents on the dark stage).
export const tint = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k));
  return `rgb(${c.join(",")})`;
};
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};

// Simple line icons drawn in-house (24×24 grid).
export const Icon: React.FC<{ i: number; c: string; size: number; draw?: number }> = ({ i, c, size, draw = 1 }) => {
  const p = { fill: "none", stroke: c, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw };
  const shapes = [
    <><circle cx="10.5" cy="10.5" r="6" {...p} /><path d="M15 15 L20.5 20.5" {...p} /></>,
    <><circle cx="12" cy="12" r="2.4" {...p} /><circle cx="5" cy="6" r="2" {...p} /><circle cx="19" cy="6" r="2" {...p} /><circle cx="12" cy="20.5" r="2" {...p} /><path d="M6.6 7.2 L10.2 10.6 M17.4 7.2 L13.8 10.6 M12 14.4 L12 18.5" {...p} /></>,
    <><path d="M4 20.5 H20.5" {...p} /><path d="M6.5 20 V13 M11 20 V8 M15.5 20 V11 M20 20 V5" {...p} /></>,
    <><path d="M2.5 9.5 L12 5 L21.5 9.5 L12 14 Z" {...p} /><path d="M6.5 11.5 V16 C8.5 18 15.5 18 17.5 16 V11.5 M21.5 9.5 V14.5" {...p} /></>,
    <><path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z" {...p} /><path d="M4 7.5 L12 12 L20 7.5 M12 12 V21" {...p} /></>,
    <><path d="M12 4 V20 M7 20 H17 M4.5 7 H19.5" {...p} /><path d="M4.5 7 L2 13 C3 15 6 15 7 13 Z M19.5 7 L17 13 C18 15 21 15 22 13 Z" {...p} /></>,
    <><path d="M16.5 4.5 L19.5 7.5 L10 17 L6.5 17.5 L7 14 Z" {...p} /><path d="M4 20.5 C 9 22 16 21 20 17" {...p} /></>,
    <><path d="M6 3.5 V9 C6 12.5 12 12.5 12 9 V3.5" {...p} /><path d="M9 12 V15 C9 19 16 19.5 16.5 15.5 V13" {...p} /><circle cx="16.5" cy="11" r="2" {...p} /></>,
    <><path d="M12 2.5 L19 9 L12 21.5 L5 9 Z" {...p} /><path d="M5 9 H19 M9 9 L12 21.5 L15 9 M9 9 L12 2.5 L15 9" {...p} /></>,
  ];
  return <svg viewBox="0 0 24 24" width={size} height={size}>{shapes[i]}</svg>;
};

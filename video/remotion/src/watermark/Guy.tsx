import { interpolate, useCurrentFrame } from "remotion";

// Flat-vector male student (orange hoodie, messy hair). Drawn in a 400×600 box (upper body).
// expr: facial expression · armL/armR: rotation (deg) around the shoulders, 0 = hanging down, positive = forward/up.
export type Expr = "neutral" | "shock" | "panic" | "confused" | "happy" | "confident";

const SKIN = "#F1C49E", SKIN_D = "#DDA67E", HAIR = "#2B2420", HOOD = "#EE6A1F", HOOD_D = "#C9561A", INK = "#2B2420";

export const Guy: React.FC<{ expr?: Expr; armL?: number; armR?: number; sweat?: boolean; look?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ expr = "neutral", armL = 0, armR = 0, sweat = false, look = 0, style, children }) => {
  const f = useCurrentFrame();
  const blink = f % 84 > 78 && expr !== "shock" && expr !== "happy";
  const bob = Math.sin(f / 9) * 3;
  const eyes = () => {
    if (expr === "happy") return (<g stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round"><path d="M150 178 q15 -16 30 0" /><path d="M220 178 q15 -16 30 0" /></g>);
    if (expr === "shock") return (<g><circle cx={165} cy={176} r={20} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={235} cy={176} r={20} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={165 + look} cy={178} r={7} fill={INK} /><circle cx={235 + look} cy={178} r={7} fill={INK} /></g>);
    return (<g fill={INK}><ellipse cx={165 + look} cy={178} rx={10} ry={blink ? 1.5 : 13} /><ellipse cx={235 + look} cy={178} rx={10} ry={blink ? 1.5 : 13} /></g>);
  };
  const brows = () => {
    const b: Record<Expr, [number, number]> = { neutral: [0, 0], shock: [-10, 10], panic: [14, -14], confused: [-12, 6], happy: [-4, 4], confident: [8, -8] };
    const [l, r] = b[expr];
    const y = expr === "shock" ? 138 : 148;
    return (<g stroke={INK} strokeWidth={7} strokeLinecap="round"><line x1={148} y1={y} x2={182} y2={y} transform={`rotate(${l} 165 ${y})`} /><line x1={218} y1={y} x2={252} y2={y} transform={`rotate(${r} 235 ${y})`} /></g>);
  };
  const mouth = () => {
    switch (expr) {
      case "shock": return <ellipse cx={200} cy={232} rx={16} ry={20} fill={INK} />;
      case "panic": return <path d="M176 236 q8 -10 16 0 q8 10 16 0 q8 -10 16 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
      case "confused": return <path d="M182 236 q18 -8 36 4" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
      case "happy": return <path d="M172 222 q28 30 56 0 z" fill={INK} />;
      case "confident": return <path d="M176 226 q24 20 48 0" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
      default: return <path d="M184 230 q16 8 32 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    }
  };
  const arm = (side: -1 | 1, rot: number) => {
    const sx = side === -1 ? 120 : 280;
    return (
      <g transform={`rotate(${side === -1 ? rot : -rot} ${sx} 330)`}>
        <rect x={sx - 30} y={318} width={60} height={210} rx={30} fill={HOOD_D} />
        <circle cx={sx} cy={530} r={30} fill={SKIN} />
      </g>
    );
  };
  return (
    <div style={{ position: "absolute", width: 400, height: 600, ...style }}>
      <svg viewBox="0 0 400 600" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g transform={`translate(0 ${bob})`}>
          {arm(-1, armL)}
          {arm(1, armR)}
          {/* torso */}
          <path d="M80 600 Q80 360 130 315 L270 315 Q320 360 320 600 Z" fill={HOOD} />
          <path d="M150 312 Q200 360 250 312 L250 300 Q200 330 150 300 Z" fill={HOOD_D} />
          <line x1={186} y1={340} x2={182} y2={400} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          <line x1={214} y1={340} x2={218} y2={400} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          <rect x={150} y={470} width={100} height={60} rx={14} fill={HOOD_D} />
          {/* neck + head */}
          <rect x={176} y={248} width={48} height={60} rx={18} fill={SKIN_D} />
          <circle cx={108} cy={185} r={20} fill={SKIN} /><circle cx={292} cy={185} r={20} fill={SKIN} />
          <circle cx={200} cy={180} r={92} fill={SKIN} />
          <path d="M104 170 Q96 80 170 70 Q190 40 230 62 Q300 66 300 150 Q290 120 262 118 Q250 96 220 112 Q196 90 170 112 Q140 104 128 132 Q112 140 104 170 Z" fill={HAIR} />
          {expr === "happy" ? (<g fill="#F49A84" opacity={0.6}><ellipse cx={140} cy={210} rx={16} ry={9} /><ellipse cx={260} cy={210} rx={16} ry={9} /></g>) : null}
          {brows()}
          {eyes()}
          {mouth()}
          {sweat ? <path d={`M286 ${120 + (f % 30) * 1.2} q10 18 0 26 q-10 -8 0 -26 z`} fill="#7CC4F2" opacity={interpolate(f % 30, [0, 24, 30], [1, 1, 0])} /> : null}
          {children}
        </g>
      </svg>
    </div>
  );
};

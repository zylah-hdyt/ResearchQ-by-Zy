import { AbsoluteFill, useCurrentFrame } from "remotion";

// Varied dark backdrops (one per scene so a film never sits on a single background). Palette stays warm: black base,
// ResearchQ orange, with navy / plum / ember tints for contrast. Everything is CSS, seek-safe (drift is derived from the frame).
export type BackdropVariant = "warm" | "ember" | "navy" | "grid" | "dots" | "scan" | "plum" | "plain";

export const Backdrop: React.FC<{ variant: BackdropVariant }> = ({ variant }) => {
  const f = useCurrentFrame();
  if (variant === "ember")
    return <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 55% at 82% 8%, rgba(242,138,46,.42), transparent 62%), radial-gradient(ellipse 80% 45% at 8% 96%, rgba(200,60,20,.30), transparent 65%), #0B0604" }} />;
  if (variant === "navy")
    return <AbsoluteFill style={{ background: "radial-gradient(ellipse 100% 55% at 50% 102%, rgba(50,100,235,.50), transparent 62%), radial-gradient(ellipse 70% 40% at 12% 2%, rgba(242,138,46,.20), transparent 60%), #050A14" }} />;
  if (variant === "plum")
    return <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 55% at 18% 6%, rgba(124,58,237,.38), transparent 62%), radial-gradient(ellipse 80% 40% at 90% 100%, rgba(242,138,46,.28), transparent 62%), #090510" }} />;
  if (variant === "dots")
    return (
      <AbsoluteFill style={{ background: "#0A0807" }}>
        <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.17) 2.2px, transparent 3px)", backgroundSize: "52px 52px", backgroundPosition: `${f * 0.6}px ${f * 0.9}px`, WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 20%, transparent 85%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 45% at 88% 4%, rgba(242,138,46,.40), transparent 60%)" }} />
      </AbsoluteFill>
    );
  if (variant === "scan") {
    const y = ((f * 8) % 2400) - 300;
    return (
      <AbsoluteFill style={{ background: "#070403" }}>
        <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,.04) 0, rgba(255,255,255,.04) 2px, transparent 2px, transparent 7px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 380, background: "linear-gradient(to bottom, transparent, rgba(242,138,46,.16), transparent)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 40% at 50% 100%, rgba(242,138,46,.30), transparent 65%)" }} />
      </AbsoluteFill>
    );
  }
  if (variant === "grid")
    return (
      <AbsoluteFill style={{ background: "#070605", overflow: "hidden" }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 100% 40% at 50% 62%, rgba(242,138,46,.30), transparent 65%)" }} />
        <div style={{ position: "absolute", left: -600, right: -600, top: 1180, height: 1400, perspective: 700, perspectiveOrigin: "50% 0%" }}>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 0%", transform: "rotateX(72deg)", backgroundImage: "linear-gradient(rgba(242,138,46,.40) 3px, transparent 3px), linear-gradient(90deg, rgba(242,138,46,.40) 3px, transparent 3px)", backgroundSize: "110px 110px", backgroundPosition: `0px ${f * 2.4}px`, WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 25%, #000 100%)" }} />
        </div>
      </AbsoluteFill>
    );
  if (variant === "plain") return <AbsoluteFill style={{ background: "#000" }} />;
  return <AbsoluteFill style={{ background: "#060504" }} />;
};

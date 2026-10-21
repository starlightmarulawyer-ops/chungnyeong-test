import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EMOJI, JUA } from "../fonts";

type Box = { left: number; top: number; right: number; bottom: number };

// Camera-style focus corners that snap onto the bear. Only the corners are
// drawn, so the bear itself stays fully visible.
export const FocusBrackets: React.FC<{
  frames: number[];
  boxes: Box[];
}> = ({ frames, boxes }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const snap = spring({ frame, fps, config: { damping: 15, stiffness: 260 } });
  const fade = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const at = (key: keyof Box) =>
    interpolate(
      frame,
      frames,
      boxes.map((b) => b[key]),
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  const left = at("left");
  const top = at("top");
  const width = at("right") - left;
  const height = at("bottom") - top;
  const arm = 64;
  const stroke = 8;
  const color = "rgba(255,255,255,0.92)";
  const corner = (h: "left" | "right", v: "top" | "bottom") => (
    <div
      key={h + v}
      style={{
        position: "absolute",
        [h]: 0,
        [v]: 0,
        width: arm,
        height: arm,
        [`border${v === "top" ? "Top" : "Bottom"}`]: `${stroke}px solid ${color}`,
        [`border${h === "left" ? "Left" : "Right"}`]: `${stroke}px solid ${color}`,
        [`border${v === "top" ? "Top" : "Bottom"}${h === "left" ? "Left" : "Right"}Radius`]: 18,
        filter: "drop-shadow(0 0 6px rgba(0,0,0,0.5))",
      }}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        opacity: fade * interpolate(snap, [0, 1], [0, 1]),
        scale: String(interpolate(snap, [0, 1], [1.35, 1])),
      }}
    >
      {corner("left", "top")}
      {corner("right", "top")}
      {corner("left", "bottom")}
      {corner("right", "bottom")}
    </div>
  );
};

// A little burst of emoji confetti flying away from the waving paw.
export const SparkleBurst: React.FC<{
  x: number;
  y: number;
  // Main direction the burst travels in, in degrees (0 = right, 90 = down)
  direction?: number;
}> = ({ x, y, direction = 225 }) => {
  const frame = useCurrentFrame();
  const particles = ["✨", "💕", "⭐", "✨", "💖", "⭐", "✨"];

  return (
    <>
      {particles.map((p, i) => {
        const angle =
          ((direction + (i - (particles.length - 1) / 2) * 22) * Math.PI) / 180;
        const dist = interpolate(frame, [0, 22], [0, 170 + (i % 3) * 50], {
          extrapolateRight: "clamp",
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
        const life = interpolate(frame, [0, 4, 16, 26], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(angle) * dist - 26,
              top: y + Math.sin(angle) * dist - 26 + frame * 0.6,
              fontFamily: EMOJI,
              fontSize: 40 + (i % 2) * 14,
              opacity: life,
              scale: String(0.6 + 0.6 * life),
              rotate: `${frame * (i % 2 ? 6 : -6)}deg`,
            }}
          >
            {p}
          </div>
        );
      })}
    </>
  );
};

// A waving-hand emoji with motion arcs, placed beside the bear's raised paw.
export const WavingHand: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 220 } });
  const swing = Math.sin((frame / fps) * Math.PI * 5) * 22;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 150,
        height: 150,
        scale: String(pop),
      }}
    >
      <svg
        width={150}
        height={150}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        {[0, 1].map((k) => (
          <path
            key={k}
            d={`M ${118 + k * 18} ${20 - k * 6} Q ${140 + k * 22} 60 ${118 + k * 18} 100`}
            fill="none"
            stroke="white"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.5 + 0.4 * Math.abs(Math.sin(frame / 4 + k))}
          />
        ))}
      </svg>
      <div
        style={{
          fontFamily: EMOJI,
          fontSize: 104,
          lineHeight: 1,
          rotate: `${swing}deg`,
          transformOrigin: "60% 90%",
          filter: "drop-shadow(0 6px 4px rgba(0,0,0,0.35))",
        }}
      >
        👋
      </div>
    </div>
  );
};

// Small sticky tag with an arrow pointing at a background character.
export const PointerTag: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
}> = ({ x, y, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 200 } });
  const fade = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const nudge = Math.sin(frame / 5) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 6,
        scale: String(pop * fade),
        transformOrigin: "0% 50%",
      }}
    >
      <div
        style={{
          padding: "8px 22px 4px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.9)",
          border: "4px solid #2b1d14",
          color: "#2b1d14",
          fontFamily: `${JUA}, ${EMOJI}`,
          fontSize: 44,
          whiteSpace: "nowrap",
          rotate: "-3deg",
        }}
      >
        {children}
      </div>
      <svg
        width={90}
        height={70}
        style={{ overflow: "visible", translate: `${nudge}px ${nudge / 2}px` }}
      >
        <path
          d="M 6 14 Q 50 10 72 50"
          fill="none"
          stroke="white"
          strokeWidth={8}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.6))" }}
        />
        <path
          d="M 52 48 L 74 54 L 80 30"
          fill="none"
          stroke="white"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.6))" }}
        />
      </svg>
    </div>
  );
};

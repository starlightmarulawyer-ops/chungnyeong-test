import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EMOJI, JUA } from "../fonts";

type Props = {
  // Top-left corner of the bubble in composition pixels
  x: number;
  y: number;
  // The tail leaves the bubble's left edge at `tailY` and points towards the
  // bear: 0deg is straight left, positive angles tilt it downwards.
  tailY?: number;
  tailAngle?: number;
  tailLength?: number;
  tilt?: number;
  fontSize?: number;
  // Keep the bubble up until the very end instead of popping it away
  stay?: boolean;
  children: React.ReactNode;
};

const INK = "#2b1d14";
const PAPER = "#fffdf8";

// A cartoon speech bubble that pops in with an overshoot, wobbles a little
// while visible and shrinks away at the end of its Sequence.
export const SpeechBubble: React.FC<Props> = ({
  x,
  y,
  tailY = 90,
  tailAngle = 30,
  tailLength = 90,
  tilt = -4,
  fontSize = 60,
  stay = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const popIn = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 220, mass: 0.7 },
  });
  const popOut = stay
    ? 1
    : interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const wobble = Math.sin(frame / 7) * 1.5;

  const rad = (tailAngle * Math.PI) / 180;
  const tipX = 40 - tailLength * Math.cos(rad);
  const tipY = tailY + tailLength * Math.sin(rad);
  const tail = `M 46 ${tailY - 30} L ${tipX} ${tipY} L 46 ${tailY + 30} Z`;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        scale: String(popIn * popOut),
        rotate: `${tilt + wobble}deg`,
        transformOrigin: `${tipX}px ${tipY}px`,
      }}
    >
      <svg
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        width={1}
        height={1}
      >
        <path
          d={tail}
          fill={PAPER}
          stroke={INK}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "relative",
          padding: "22px 34px 18px",
          borderRadius: 40,
          background: PAPER,
          border: `6px solid ${INK}`,
          boxShadow: "0 10px 0 rgba(43,29,20,0.35)",
          color: INK,
          fontFamily: `${JUA}, ${EMOJI}`,
          fontSize,
          lineHeight: 1.15,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

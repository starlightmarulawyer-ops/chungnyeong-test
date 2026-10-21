import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EMOJI } from "../fonts";

// Faint paw prints drifting up along the left and right edges.
export const PawTrail: React.FC = () => {
  const frame = useCurrentFrame();
  const prints = [
    { x: 978, offset: 0, size: 54 },
    { x: 1004, offset: 45, size: 42 },
    { x: 970, offset: 90, size: 48 },
    { x: 34, offset: 25, size: 44 },
    { x: 58, offset: 75, size: 50 },
  ];
  const cycle = 135;

  return (
    <>
      {prints.map((p, i) => {
        const t = ((frame + p.offset) % cycle) / cycle;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x - p.size / 2,
              top: interpolate(t, [0, 1], [1880, 1160]),
              fontFamily: EMOJI,
              fontSize: p.size,
              opacity: interpolate(t, [0, 0.15, 0.8, 1], [0, 0.4, 0.4, 0]),
              rotate: `${(i % 2 ? 1 : -1) * (15 + t * 20)}deg`,
            }}
          >
            🐾
          </div>
        );
      })}
    </>
  );
};

// Soft warm vignette: darkens only the corners, the centre stays untouched.
export const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,20,5,0.35) 100%)",
    }}
  />
);

// A translucent light streak that sweeps across during the whip pan.
export const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const x = interpolate(frame, [0, durationInFrames], [-900, 1300], {
    easing: (t) => t * t * (3 - 2 * t),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: -300,
        left: x,
        width: 420,
        height: 2600,
        rotate: "18deg",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,250,235,0.45) 50%, rgba(255,255,255,0) 100%)",
        mixBlendMode: "screen",
      }}
    />
  );
};

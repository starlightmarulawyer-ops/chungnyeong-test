import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EMOJI, JUA } from "../fonts";

type Props = {
  // Fill level keyframes, in frames relative to the gauge's Sequence
  fillFrames: number[];
  fillValues: number[];
  // Frame (relative) at which the gauge maxes out and celebrates
  maxAt: number;
};

const HEIGHT = 440;
const WIDTH = 62;

// Vertical "charm meter" docked on the left edge, over the fence, filling up
// every time the bear waves.
export const CharmGauge: React.FC<Props> = ({
  fillFrames,
  fillValues,
  maxAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 170 } });
  const fill = interpolate(frame, fillFrames, fillValues, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });
  const maxPop = spring({
    frame: frame - maxAt,
    fps,
    config: { damping: 7, stiffness: 240, mass: 0.6 },
  });
  const isMax = frame >= maxAt;
  const glow = isMax ? 18 + Math.sin(frame / 3) * 10 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 46,
        top: 600,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        translate: `${interpolate(enter, [0, 1], [-200, 0])}px 0px`,
      }}
    >
      <div
        style={{
          fontFamily: `${JUA}, ${EMOJI}`,
          fontSize: 36,
          color: "white",
          textShadow: "0 3px 0 rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.5)",
        }}
      >
        애교력
      </div>
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          borderRadius: WIDTH / 2,
          background: "rgba(20,12,8,0.35)",
          border: "4px solid rgba(255,255,255,0.85)",
          overflow: "hidden",
          boxShadow: `0 0 ${glow}px ${glow / 2}px rgba(255,107,139,0.85)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${fill}%`,
            background:
              "linear-gradient(0deg, #ff6b8b 0%, #ffb35c 70%, #ffd84d 100%)",
          }}
        />
        {[0.25, 0.5, 0.75].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              top: HEIGHT * t,
              height: 3,
              background: "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: EMOJI,
          fontSize: 54,
          scale: String(1 + 0.15 * Math.sin(frame / 4) * (isMax ? 1 : 0.3)),
        }}
      >
        💖
      </div>
      <div
        style={{
          position: "absolute",
          left: -6,
          top: -62,
          padding: "6px 18px 2px",
          borderRadius: 16,
          background: "#ff3b6b",
          color: "white",
          fontFamily: `${JUA}, ${EMOJI}`,
          fontSize: 44,
          whiteSpace: "nowrap",
          rotate: "-8deg",
          scale: String(isMax ? maxPop : 0),
          boxShadow: "0 5px 0 #2b1d14",
        }}
      >
        MAX!
      </div>
    </div>
  );
};

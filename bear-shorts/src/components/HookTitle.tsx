import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLACK_HAN_SANS, EMOJI, JUA } from "../fonts";

const INK = "#2b1d14";
const ACCENT = "#ffd84d";
const PINK = "#ff6b8b";

const HEADLINE = ["곰", " ", "영", "업", " ", "실", "화", "냐", "ㅋ", "ㅋ"];
const ACCENT_CHARS = new Set([2, 3]);

// Opening hook: a pink kicker pill and a headline whose letters bounce in one
// by one, then the whole block lifts away so the footage is clean again.
export const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const kicker = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const leave = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 150,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        opacity: 1 - leave,
        translate: `0px ${-120 * leave}px`,
        scale: String(1 - 0.3 * leave),
      }}
    >
      <div
        style={{
          padding: "10px 30px 6px",
          borderRadius: 999,
          background: PINK,
          color: "white",
          fontFamily: `${JUA}, ${EMOJI}`,
          fontSize: 46,
          boxShadow: `0 6px 0 ${INK}`,
          scale: String(kicker),
          rotate: "-2deg",
        }}
      >
        🐻 동물원 실제 상황
      </div>
      <div
        style={{
          display: "flex",
          rotate: "-3deg",
          fontFamily: BLACK_HAN_SANS,
          fontSize: 104,
          lineHeight: 1,
          color: "white",
          WebkitTextStroke: `14px ${INK}`,
          paintOrder: "stroke fill",
          textShadow: `0 10px 0 ${INK}`,
        }}
      >
        {HEADLINE.map((ch, i) => {
          const s = spring({
            frame: frame - 5 - i * 2,
            fps,
            config: { damping: 8, stiffness: 260, mass: 0.6 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                color: ACCENT_CHARS.has(i) ? ACCENT : "white",
                scale: String(s),
                translate: `0px ${interpolate(s, [0, 1], [-60, 0])}px`,
                rotate: `${Math.sin(frame / 6 + i) * (i >= 8 ? 6 : 0)}deg`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Small broadcast-style badge that stays in the top-left corner once the hook
// title has left.
export const LiveBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25;

  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 130,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 24px 8px 20px",
        borderRadius: 999,
        background: "rgba(20,12,8,0.45)",
        border: "3px solid rgba(255,255,255,0.55)",
        color: "white",
        fontFamily: `${JUA}, ${EMOJI}`,
        fontSize: 38,
        translate: `${interpolate(enter, [0, 1], [-420, 0])}px 0px`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: "#ff3b3b",
          opacity: blink,
          boxShadow: "0 0 12px #ff3b3b",
        }}
      />
      <span style={{ fontFamily: BLACK_HAN_SANS, letterSpacing: 2 }}>LIVE</span>
      <span>곰 영업 현장</span>
    </div>
  );
};

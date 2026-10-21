import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SpeechBubble } from "./components/SpeechBubble";
import { BLACK_HAN_SANS, EMOJI, JUA } from "./fonts";

const INK = "#2b1d14";
const ACCENT = "#ffd84d";
const PINK = "#ff6b8b";

// Cover image: the ace bear mid-wave (source frame at 5.5s), zoomed in, with
// the hook headline on top. Fully static so it works both as a Still and as
// the end card of the video.
export const Thumbnail: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <Img
        src={staticFile("thumb-bg.jpg")}
        style={{
          position: "absolute",
          left: -266,
          top: -117,
          width: 1566,
          height: 2784,
          filter: "saturate(1.2) contrast(1.08) brightness(1.04)",
        }}
      />
      {/* Darken the top and bottom so the text pops, keep the bear bright */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(20,10,4,0.65) 0%, rgba(20,10,4,0.15) 30%, rgba(20,10,4,0) 40%, rgba(20,10,4,0) 75%, rgba(20,10,4,0.55) 100%)",
        }}
      />

      {/* Red ring around the waving paw */}
      <div
        style={{
          position: "absolute",
          left: 419 - 105,
          top: 760 - 105,
          width: 210,
          height: 210,
          borderRadius: "50%",
          border: "12px solid #ff3b3b",
          boxShadow: "0 0 0 5px white, 0 0 24px rgba(0,0,0,0.5)",
          rotate: "-8deg",
        }}
      />

      <SpeechBubble
        still
        x={700}
        y={720}
        tailY={70}
        tailAngle={10}
        fontSize={76}
        tilt={-6}
      >
        하이~👋
      </SpeechBubble>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "12px 36px 8px",
            borderRadius: 999,
            background: PINK,
            color: "white",
            fontFamily: `${JUA}, ${EMOJI}`,
            fontSize: 58,
            boxShadow: `0 7px 0 ${INK}`,
            rotate: "-2deg",
          }}
        >
          🐻 동물원 실제 상황
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: BLACK_HAN_SANS,
            fontSize: 210,
            lineHeight: 1,
            color: ACCENT,
            WebkitTextStroke: `22px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 14px 0 ${INK}`,
            rotate: "-3deg",
          }}
        >
          곰 영업
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: BLACK_HAN_SANS,
            fontSize: 170,
            lineHeight: 1,
            color: "white",
            WebkitTextStroke: `20px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `0 12px 0 ${INK}`,
            rotate: "-3deg",
          }}
        >
          실화냐ㅋㅋ
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1520,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "18px 40px 12px",
            borderRadius: 30,
            background: "rgba(24,14,8,0.6)",
            color: "white",
            fontFamily: `${BLACK_HAN_SANS}, ${EMOJI}`,
            fontSize: 72,
            textShadow: "0 4px 0 rgba(0,0,0,0.45)",
          }}
        >
          손 흔들며 <span style={{ color: ACCENT }}>영업 중</span> 👋
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BLACK_HAN_SANS, EMOJI } from "../fonts";

type Props = {
  text: string;
  // Part of `text` drawn in the accent colour
  highlight?: string;
  y?: number;
  // Keep the caption up until the very end instead of fading it out
  stay?: boolean;
};

const ACCENT = "#ffd84d";

// Narrator-style caption on a translucent pill, sitting over the net at the
// bottom of the frame so the bears stay clear.
export const Caption: React.FC<Props> = ({
  text,
  highlight,
  y = 1330,
  stay = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const exit = stay
    ? 1
    : interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const parts =
    highlight && text.includes(highlight) ? text.split(highlight) : [text];

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        opacity: exit,
        translate: `0px ${interpolate(enter, [0, 1], [40, 0])}px`,
        scale: String(interpolate(enter, [0, 1], [0.85, 1])),
      }}
    >
      <div
        style={{
          maxWidth: 860,
          padding: "16px 36px 12px",
          borderRadius: 28,
          background: "rgba(24,14,8,0.55)",
          color: "white",
          fontFamily: `${BLACK_HAN_SANS}, ${EMOJI}`,
          fontSize: 62,
          lineHeight: 1.2,
          textAlign: "center",
          textShadow: "0 4px 0 rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {parts.length === 2 ? (
          <>
            {parts[0]}
            <span style={{ color: ACCENT }}>{highlight}</span>
            {parts[1]}
          </>
        ) : (
          text
        )}
      </div>
    </div>
  );
};

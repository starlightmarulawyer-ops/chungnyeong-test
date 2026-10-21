import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  FocusBrackets,
  PointerTag,
  SparkleBurst,
  WavingHand,
} from "./components/BearFx";
import { Caption } from "./components/Caption";
import { CharmGauge } from "./components/CharmGauge";
import { LightSweep, PawTrail, Vignette } from "./components/Decor";
import { HookTitle, LiveBadge } from "./components/HookTitle";
import { SpeechBubble } from "./components/SpeechBubble";
import "./fonts";

// Last frame of the source clip; after this the picture is held as a freeze
// frame for the outro.
export const FOOTAGE_END = 331;

const sfx = (name: string) => staticFile(`sfx/${name}.mp3`);

export const BearShorts: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Footage plus everything that has to stick to the bears */}
      <AbsoluteFill
        name="Camera"
        style={{
          transformOrigin: "48% 45%",
          scale: String(
            interpolate(
              frame,
              [0, 14, 148, 156, 200, 300, 312, 320, 332, 372],
              [1.12, 1, 1, 1.07, 1.03, 1, 1, 1.05, 1.05, 1.12],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.cubic),
              },
            ),
          ),
        }}
      >
        <Freeze frame={FOOTAGE_END} active={(f) => f >= FOOTAGE_END}>
          <Video
            name="Bear footage"
            src={staticFile("bear.mp4")}
            muted
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              // The source picks up haze in its last second; pull the
              // contrast back up so the freeze frame stays crisp.
              filter: `saturate(${interpolate(frame, [296, 331], [1.15, 1.3], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}) contrast(${interpolate(frame, [296, 331], [1.05, 1.25], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}) brightness(${interpolate(frame, [296, 331], [1.03, 0.93], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
            }}
          />
        </Freeze>

        <Sequence name="Focus on the ace" from={150} durationInFrames={50}>
          <FocusBrackets
            frames={[0, 15, 45]}
            boxes={[
              { left: 305, top: 520, right: 715, bottom: 1090 },
              { left: 360, top: 520, right: 735, bottom: 1100 },
              { left: 305, top: 600, right: 710, bottom: 1200 },
            ]}
          />
        </Sequence>
        <Sequence name="Wave sparkles" from={156} durationInFrames={28}>
          <SparkleBurst x={435} y={600} direction={235} />
        </Sequence>
        <Sequence name="Final wave sparkles" from={314} durationInFrames={28}>
          <SparkleBurst x={410} y={770} direction={215} />
        </Sequence>
        <Sequence name="Final waving hand" from={316}>
          <WavingHand x={200} y={620} />
        </Sequence>
      </AbsoluteFill>

      <Vignette />
      <PawTrail />

      {/* Whip pan between the two bears */}
      <Sequence name="Pan sweep" from={46} durationInFrames={22}>
        <LightSweep />
      </Sequence>

      {/* Freeze-frame flash */}
      <AbsoluteFill
        name="Flash"
        style={{
          backgroundColor: "white",
          opacity: interpolate(frame, [332, 333, 342], [0, 0.55, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Top: hook title, then the live badge */}
      <Sequence name="Hook title" durationInFrames={68}>
        <HookTitle />
      </Sequence>
      <Sequence name="Live badge" from={62}>
        <LiveBadge />
      </Sequence>

      {/* Bear voices */}
      <Sequence name="Bubble: me me" from={10} durationInFrames={42}>
        <SpeechBubble x={650} y={440} tailY={110} tailAngle={35} tilt={4}>
          저요! 저요!
          <br />
          🙌🙌
        </SpeechBubble>
      </Sequence>
      <Sequence name="Bubble: snacks?" from={100} durationInFrames={50}>
        <SpeechBubble x={660} y={250} tailY={100} tailAngle={55}>
          ...간식
          <br />
          있어요? 🍪
        </SpeechBubble>
      </Sequence>
      <Sequence name="Bubble: hi" from={156} durationInFrames={44}>
        <SpeechBubble
          x={690}
          y={370}
          tailY={60}
          tailAngle={45}
          fontSize={68}
          tilt={-6}
        >
          하이~👋
        </SpeechBubble>
      </Sequence>
      <Sequence name="Bubble: just one" from={204} durationInFrames={94}>
        <SpeechBubble x={690} y={700} tailY={80} tailAngle={15} tilt={3}>
          하나만
          <br />
          주세요🙏
        </SpeechBubble>
      </Sequence>
      <Sequence name="Bubble: come again" from={312}>
        <SpeechBubble
          stay
          x={640}
          y={560}
          tailY={70}
          tailAngle={25}
          fontSize={68}
          tilt={-5}
        >
          또 와요~💕
        </SpeechBubble>
      </Sequence>

      {/* The senior bear walking around in the back */}
      <Sequence name="Tag: senior bear" from={206} durationInFrames={90}>
        <PointerTag x={40} y={290}>
          선배곰 👀
        </PointerTag>
      </Sequence>
      <Sequence name="Tag: clocking out" from={296} durationInFrames={36}>
        <PointerTag x={40} y={290}>
          퇴근함 🚶
        </PointerTag>
      </Sequence>

      <Sequence name="Charm gauge" from={140}>
        <CharmGauge
          fillFrames={[0, 22, 56, 90, 150, 172, 178]}
          fillValues={[0, 45, 62, 70, 78, 78, 100]}
          maxAt={178}
        />
      </Sequence>

      {/* Narrator captions */}
      <Sequence name="Caption 1" from={10} durationInFrames={40}>
        <Caption text="먹이 달라고 만세하는 곰 🙌" highlight="만세" />
      </Sequence>
      <Sequence name="Caption 2" from={74} durationInFrames={76}>
        <Caption text="옆 곰은 말없이 빤-히 👀" highlight="빤-히" />
      </Sequence>
      <Sequence name="Caption 3" from={152} durationInFrames={50}>
        <Caption text="벌떡 일어나서 손 흔듦ㅋㅋ" highlight="손 흔듦" />
      </Sequence>
      <Sequence name="Caption 4" from={204} durationInFrames={94}>
        <Caption text="영업 스킬 만렙 💯" highlight="만렙" />
      </Sequence>
      <Sequence name="Caption 5" from={300}>
        <Caption text="결론: 곰도 영업함 🐻" highlight="영업함" stay />
      </Sequence>

      {/* Sound */}
      <Audio name="Original sound" src={staticFile("bear.mp4")} />
      <Audio name="Music" src={staticFile("bgm.m4a")} volume={0.3} />
      <Sequence name="SFX" layout="none">
        <Audio from={6} src={sfx("pluck-002")} volume={0.5} />
        <Audio from={10} src={sfx("notification-pop")} volume={0.55} />
        <Audio from={46} src={sfx("card-slide-1")} volume={0.9} />
        <Audio from={100} src={sfx("question-001")} volume={0.45} />
        <Audio from={150} src={sfx("jump-8bit")} volume={0.3} />
        <Audio from={156} src={sfx("notification-pop")} volume={0.55} />
        <Audio from={204} src={sfx("notification-pop")} volume={0.5} />
        <Audio from={207} src={sfx("pluck-002")} volume={0.5} />
        <Audio from={297} src={sfx("pluck-002")} volume={0.5} />
        <Audio from={312} src={sfx("notification-pop")} volume={0.55} />
        <Audio from={318} src={sfx("jingles-steel-05")} volume={0.45} />
        <Audio from={332} src={sfx("jingles-hit-08")} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

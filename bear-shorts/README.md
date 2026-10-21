# 곰 영업 쇼츠 (Remotion)

동물원 곰 영상(11초)에 모션 그래픽을 얹은 1080×1920 세로 쇼츠입니다.
완성본: `bear-shorts-final.mp4` (12.4초, -14 LUFS)

곰이 가려지지 않도록 그래픽은 화면 가장자리·반투명 위주로 배치했습니다.

| 시간 | 장면 | 그래픽 |
| --- | --- | --- |
| 0.0–4.3s | (처음부터) | 훅 타이틀 "곰 영업 실화냐ㅋㅋ" (0.8–4.0s 완전히 보임) |
| 0.0–2.3s | 만세하는 곰 | 말풍선 "저요! 저요!" |
| 1.6–2.3s | 카메라 휙 이동 | 빛줄기 스윕 + 휙 효과음 |
| 2.3–5.0s | 앉아서 빤히 보는 곰 | 말풍선 "...간식 있어요?", 타이틀이 빠지면 LIVE 배지 |
| 5.0–6.6s | 벌떡 일어나 손 흔듦 | 포커스 브래킷, 반짝이, "하이~👋", 좌측 애교력 게이지 |
| 6.6–12.4s | 손 내밀고 영업 | "하나만 주세요🙏", 뒤 곰에 "선배곰 👀" → 9.9s부터 끝까지 노란 "선배곰 퇴근 🚶" 태그 |
| 10.4–12.4s | 다시 손 흔듦 + 정지 화면 | 게이지 MAX, "또 와요~💕", "결론: 곰도 영업함 🐻" |

## 작업

```console
npm i --loglevel=error
npm run dev                     # Remotion Studio 미리보기
npx remotion render BearShorts out/bear-shorts.mp4 --codec=h264 --crf=18
```

렌더 결과(`out/bear-shorts.mp4`)의 오디오를 ffmpeg `loudnorm` 2-pass와
`alimiter`로 약 -14 LUFS / 트루피크 -1.5dB에 맞추고(영상 스트림은 그대로 복사)
12.4초로 잘라 `bear-shorts-final.mp4`를 만들었습니다.

## 소스

- `public/bear.mp4` – 원본 영상(회전 메타데이터를 반영해 720×1280 / 30fps로 변환)
- `public/bgm.m4a` – `scripts/make-bgm.py`로 합성한 마림바 BGM
- `public/sfx/*` – [soundcn](https://github.com/kapishdima/soundcn)의 CC0 효과음 (Kenney)
- `public/fonts/*` – Jua, Black Han Sans (Google Fonts, SIL OFL)
- 장면별 타이밍과 텍스트는 `src/BearShorts.tsx`에서 수정할 수 있습니다.

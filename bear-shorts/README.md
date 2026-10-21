# 곰 영업 쇼츠 (Remotion)

동물원 곰 영상(11초)에 모션 그래픽을 얹은 1080×1920 세로 쇼츠입니다.

- 완성본: `bear-shorts-final.mp4` (12.8초, 약 -14 LUFS, 첫 프레임과 MP4 표지가 썸네일)
- 썸네일: `thumbnail.jpg` (1080×1920)

곰이 가려지지 않도록 그래픽은 화면 가장자리·반투명 위주로 배치했습니다.

| 시간 | 장면 | 그래픽 |
| --- | --- | --- |
| 0.0–0.6s | 썸네일 인트로 | 썸네일 (0–0.4s 고정, 0.4–0.6s 본 영상으로 전환) |
| 0.4–4.7s | (본 영상 시작) | 훅 타이틀 "곰 영업 실화냐ㅋㅋ" (1.2–4.4s 완전히 보임) |
| 0.4–2.7s | 만세하는 곰 | 말풍선 "저요! 저요!" |
| 2.0–2.7s | 카메라 휙 이동 | 빛줄기 스윕 + 휙 효과음 |
| 2.7–5.4s | 앉아서 빤히 보는 곰 | 말풍선 "...간식 있어요?", 타이틀이 빠지면 LIVE 배지 |
| 5.4–7.0s | 벌떡 일어나 손 흔듦 | 포커스 브래킷, 반짝이, "하이~👋", 좌측 애교력 게이지 |
| 7.0–12.8s | 손 내밀고 영업 | "하나만 주세요🙏", 뒤 곰에 "선배곰 👀" → 10.3s부터 노란 "선배곰 퇴근 🚶" 태그 |
| 10.8–12.8s | 다시 손 흔듦 + 정지 화면 | 게이지 MAX, "또 와요~💕", "결론: 곰도 영업함 🐻" |

## 썸네일

5.5초 장면(손을 번쩍 든 곰)을 확대하고 "곰 영업 실화냐ㅋㅋ" 제목, 손에 빨간 원,
"하이~👋" 말풍선, "손 흔들며 영업 중 👋"을 얹었습니다 (`src/Thumbnail.tsx`).

썸네일은 영상 맨 앞(0–0.4s)에 고정 화면으로 들어가 있어, 재생 전 대기 화면과
업로드 화면의 기본 표지가 첫 프레임인 경우 이 썸네일이 보입니다. 쇼츠 업로드에서
표지 프레임을 고를 때는 맨 앞 프레임을 고르면 됩니다. 또 `thumbnail.jpg`를 MP4 표지
메타데이터(`covr`)로도 넣어 두어, 파일 탐색기나 일부 플레이어에서도 표지로 보입니다.
커버 이미지를 따로 올릴 수 있는 곳(릴스 등)에는 `thumbnail.jpg`를 쓰면 됩니다.

## 작업

```console
npm i --loglevel=error
npm run dev                     # Remotion Studio 미리보기
npx remotion render BearShorts out/bear-shorts.mp4 --codec=h264 --crf=18
npx remotion still Thumbnail out/thumbnail.png
```

렌더 결과(`out/bear-shorts.mp4`)의 오디오를 ffmpeg `loudnorm` 2-pass와
`alimiter`로 약 -14 LUFS / 트루피크 -1.5dB 이하로 맞추고(영상 스트림은 그대로 복사)
`thumbnail.jpg`를 표지로 넣어 `bear-shorts-final.mp4`를 만들었습니다:

```console
ffmpeg -i normalized.mp4 -i thumbnail.jpg -map 0:v -map 0:a -map 1 -c copy \
  -disposition:v:1 attached_pic -movflags +faststart bear-shorts-final.mp4
```

## 소스

- `public/bear.mp4` – 원본 영상(회전 메타데이터를 반영해 720×1280 / 30fps로 변환)
- `public/thumb-bg.jpg` – 원본 5.5초 프레임을 2배 업스케일한 썸네일 배경
- `public/bgm.m4a` – `scripts/make-bgm.py`로 합성한 마림바 BGM
- `public/sfx/*` – [soundcn](https://github.com/kapishdima/soundcn)의 CC0 효과음 (Kenney)
- `public/fonts/*` – Jua, Black Han Sans (Google Fonts, SIL OFL)
- 장면별 타이밍과 텍스트는 `src/BearShorts.tsx`에서 수정할 수 있습니다.

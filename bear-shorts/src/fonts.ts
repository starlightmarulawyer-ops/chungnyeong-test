import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const JUA = "Jua";
export const BLACK_HAN_SANS = "Black Han Sans";

loadFont({ family: JUA, url: staticFile("fonts/Jua-Regular.ttf") });
loadFont({
  family: BLACK_HAN_SANS,
  url: staticFile("fonts/BlackHanSans-Regular.ttf"),
});

export const EMOJI = "Noto Color Emoji";

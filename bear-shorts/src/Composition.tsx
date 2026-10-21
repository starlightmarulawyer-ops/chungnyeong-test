import { Composition } from "remotion";
import { BearShorts } from "./BearShorts";

export const MyComposition = () => {
  return (
    <Composition
      id="BearShorts"
      component={BearShorts}
      durationInFrames={372}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

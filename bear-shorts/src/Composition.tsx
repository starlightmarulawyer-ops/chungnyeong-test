import { Composition, Still } from "remotion";
import { BearShorts } from "./BearShorts";
import { Thumbnail } from "./Thumbnail";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="BearShorts"
        component={BearShorts}
        durationInFrames={392}
        fps={30}
        width={1080}
        height={1920}
      />
      <Still id="Thumbnail" component={Thumbnail} width={1080} height={1920} />
    </>
  );
};

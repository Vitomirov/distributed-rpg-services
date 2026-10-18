import { Figure } from "./Figure";
import { poseOnActivist, poseOnStudent, type Place, type Pose, type PropKind } from "./poses";
import { Square } from "./Square";

export type MoraleFloat = {
  id: number;
  side: "student" | "activist";
  text: string;
};

type DuelStageProps = {
  place: Place;
  clip: Pose;
  studentProp: PropKind;
  showActivist: boolean;
  float?: MoraleFloat | null;
  compact?: boolean;
};

export function DuelStage({ place, clip, studentProp, showActivist, float, compact }: DuelStageProps) {
  const studentPose = poseOnStudent(clip);
  const activistPose = poseOnActivist(clip);

  return (
    <div className={compact ? "duel-stage compact" : "duel-stage"} data-clip={clip}>
      <Square place={place} lean={clip === "whistle" || clip === "retreat"} />
      <div className="actor" data-side="student" data-pose={studentPose}>
        <Figure skin="student" pose={studentPose} prop={studentProp} facing="right" />
      </div>
      {showActivist && (
        <div className="backdrop-gang" aria-hidden="true">
          <span><Figure skin="activist" pose="idle" prop="none" facing="left" /></span>
          <span><Figure skin="activist" pose="idle" prop="none" facing="left" /></span>
          <span><Figure skin="activist" pose="idle" prop="none" facing="left" /></span>
        </div>
      )}
      {showActivist && (
        <div className="actor" data-side="activist" data-pose={activistPose}>
          <Figure skin="activist" pose={activistPose} prop="none" facing="left" />
        </div>
      )}
      {clip === "water" && <i className="water-arc" aria-hidden="true" />}
      {clip === "uvreda" && <span className="speech">...</span>}
      {float && (
        <span key={float.id} className="hp-float" data-side={float.side}>
          {float.text}
        </span>
      )}
    </div>
  );
}

import type { Pose, PropKind } from "./poses";

type FigureProps = {
  skin: "student" | "activist";
  pose: Pose;
  prop: PropKind;
  facing: "right" | "left";
};

export function Figure({ skin, pose, prop, facing }: FigureProps) {
  const activist = skin === "activist";

  return (
    <svg className="figure" viewBox="0 0 80 160" data-pose={pose} data-skin={skin} data-facing={facing} aria-hidden="true">
      <g className="fig-leg fig-leg-left">
        <rect className="pants" x={activist ? 30 : 26} y="108" width={activist ? 8 : 12} height="36" rx="3" />
        <rect className="shoe" x={activist ? 28 : 24} y="140" width={activist ? 12 : 15} height="7" rx="2" />
      </g>
      <g className="fig-leg fig-leg-right">
        <rect className="pants" x={activist ? 44 : 43} y="108" width={activist ? 8 : 12} height="36" rx="3" />
        <rect className="shoe" x={activist ? 42 : 41} y="140" width={activist ? 12 : 15} height="7" rx="2" />
      </g>
      <g className="fig-torso">
        {activist ? (
          <rect className="shirt" x="25" y="62" width="30" height="48" rx="4" />
        ) : (
          <>
            <rect className="shirt" x="27" y="64" width="26" height="46" rx="4" />
            <path className="vest" d="M30 64 L40 76 L50 64 L56 110 L24 110 Z" />
            <rect className="vest-stripe" x="27" y="86" width="26" height="4" />
            <rect className="vest-stripe" x="27" y="96" width="26" height="3" />
            <path className="lanyard" d="M33 66 Q40 78 47 66" />
            <circle className="whistle" cx="40" cy="80" r="3.2" />
          </>
        )}
      </g>
      <g className="fig-arm fig-arm-back">
        <rect className="limb" x="14" y="66" width="9" height="38" rx="4" />
        {activist && <path className="tattoo" d="M16 78 h5 M16.5 84 h4 M16 91 l4 3" />}
        {!activist && prop === "banner" && (
          <g className="prop" transform="translate(18,96)">
            <rect x="-1" y="-22" width="2" height="26" />
            <rect x="1" y="-22" width="12" height="8" />
          </g>
        )}
        {!activist && prop === "bottle" && <rect className="bottle" x="14" y="96" width="7" height="14" rx="2" />}
      </g>
      <g className="fig-head">
        {activist ? (
          <>
            <circle className="mask" cx="40" cy="36" r="16" />
            <ellipse className="eye-hole" cx="34" cy="37" rx="4.2" ry="3" />
            <ellipse className="eye-hole" cx="47" cy="37" rx="4.2" ry="3" />
            <circle className="eye" cx="34" cy="37" r="1.5" />
            <circle className="eye" cx="47" cy="37" r="1.5" />
          </>
        ) : (
          <>
            <circle className="face" cx="40" cy="36" r="16" />
            <path className="hair" d="M24 38 Q23 14 40 14 Q57 14 56 38 Q50 20 40 20 Q29 20 25 40 Z" />
            <circle className="eye" cx="34" cy="38" r="1.6" />
            <circle className="eye" cx="46" cy="38" r="1.6" />
          </>
        )}
      </g>
      <g className="fig-arm fig-arm-front">
        <rect className="limb" x="56" y="66" width="9" height="38" rx="4" />
        {activist ? (
          <>
            <path className="tattoo" d="M58 80 h5 M58.5 86 h4 M58 93 l5 2" />
            <g className="hammer" transform="translate(58,96)">
              <rect className="hammer-handle" x="1" y="-28" width="4" height="34" rx="1" />
              <rect className="hammer-head" x="-8" y="-34" width="22" height="10" rx="1" />
            </g>
          </>
        ) : (
          <g className="megaphone" transform="translate(60,98)">
            <rect x="-2" y="-2" width="6" height="8" rx="1" />
            <polygon points="4,-1 20,-9 20,12 4,7" />
          </g>
        )}
      </g>
    </svg>
  );
}

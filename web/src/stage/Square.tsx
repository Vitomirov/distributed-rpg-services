import studentiBanner from "../../assets/banner-studenti.png";
import masinciBanner from "../../assets/banner-masinci.png";
import type { Place } from "./poses";

type SquareProps = {
  place: Place;
  lean: boolean;
};

export function Square({ place, lean }: SquareProps) {
  return (
    <div className="square" data-place={place} data-lean={lean ? "yes" : "no"}>
      <svg className="square-art" viewBox="0 0 800 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <g className="sky-bits" aria-hidden="true">
          <circle className="moon" cx="622" cy="22" r="11" />
          <circle className="star" cx="500" cy="16" r="1.3" />
          <circle className="star" cx="574" cy="34" r="1.2" />
          <circle className="star" cx="168" cy="36" r="1.2" />
        </g>
        <polygon className="block" points="18,332 18,176 46,176 46,150 78,150 78,176 250,176 250,332" />
        <polygon className="roof" points="10,176 64,128 78,128 78,150 46,150 46,176" />
        <rect className="block" x="58" y="112" width="8" height="22" />
        <polygon className="fort" points="230,332 310,268 368,236 390,228 390,214 408,214 408,228 430,220 430,204 450,204 450,216 474,208 474,190 496,190 496,204 520,198 548,214 600,246 668,332" />
        <polygon className="tree" points="318,262 334,214 350,262" />
        <polygon className="tree" points="575,268 592,218 609,268" />
        <g className="landmarks" aria-hidden="true">
          <polygon points="486,206 574,206 562,192 498,192" />
          <rect x="508" y="174" width="44" height="18" />
          <rect x="522" y="116" width="16" height="58" />
          <polygon points="516,116 528,94 540,94 546,116" />
          <rect x="518" y="70" width="24" height="28" rx="2" />
          <circle cx="530" cy="60" r="11" />
          <polygon points="538,76 554,46 560,50 544,80" />
          <polygon points="552,48 578,14 582,20 558,52" />
          <polygon points="518,82 488,94 492,100 522,88" />
          <polygon points="490,92 472,78 480,74 496,90" />
          <polygon points="488,98 470,110 478,114 498,100" />
          <rect x="588" y="46" width="22" height="278" />
          <rect x="646" y="46" width="22" height="278" />
          <rect x="588" y="88" width="80" height="20" />
          <ellipse cx="628" cy="96" rx="26" ry="14" />
        </g>
        <g className="windows">
          <rect className="window" x="34" y="196" width="22" height="28" />
          <rect className="window dim" x="68" y="196" width="22" height="28" />
          <rect className="window" x="102" y="196" width="22" height="28" />
          <rect className="window dim" x="136" y="196" width="22" height="28" />
          <rect className="window" x="170" y="196" width="22" height="28" />
          <rect className="window dim" x="204" y="196" width="22" height="28" />
          <rect className="window dim" x="34" y="240" width="22" height="28" />
          <rect className="window" x="68" y="240" width="22" height="28" />
          <rect className="window dim" x="102" y="240" width="22" height="28" />
          <rect className="window" x="136" y="240" width="22" height="28" />
          <rect className="window dim" x="170" y="240" width="22" height="28" />
          <rect className="window" x="204" y="240" width="22" height="28" />
          <rect className="window" x="34" y="284" width="22" height="28" />
          <rect className="window dim" x="102" y="284" width="22" height="28" />
          <rect className="window" x="170" y="284" width="22" height="28" />
          <rect className="window dim" x="204" y="284" width="22" height="28" />
        </g>
        <g className="street-lamps">
          <rect className="lamp" x="262" y="188" width="6" height="144" />
          <circle className="lamp-glow" cx="265" cy="184" r="13" />
          <rect className="lamp" x="456" y="210" width="6" height="122" />
          <circle className="lamp-glow" cx="459" cy="206" r="12" />
        </g>
        <g className="pavement">
          <rect x="40" y="312" width="54" height="5" />
          <rect x="140" y="312" width="54" height="5" />
          <rect x="250" y="312" width="54" height="5" />
          <rect x="500" y="312" width="54" height="5" />
          <rect x="620" y="312" width="54" height="5" />
        </g>
        <g className="place place-night">
          <rect className="lamp" x="200" y="168" width="8" height="164" />
          <circle className="lamp-glow" cx="204" cy="164" r="16" />
        </g>
        <g className="place place-road">
          <rect className="road-mark" x="0" y="300" width="70" height="8" />
          <rect className="road-mark" x="110" y="300" width="70" height="8" />
          <rect className="road-mark" x="220" y="300" width="70" height="8" />
        </g>
        <g className="place place-canopy">
          <polygon className="canopy-slab" points="80,168 250,128 270,176 110,206" />
          <polygon className="canopy-slab broken" points="290,160 460,142 478,188 314,208" />
        </g>
        <g className="place place-hall">
          <rect className="podium" x="340" y="250" width="90" height="80" />
        </g>
        <rect className="ground" x="0" y="330" width="800" height="90" />
        <g className="flares">
          <circle cx="90" cy="300" r="10" />
          <circle cx="720" cy="280" r="14" />
        </g>
      </svg>
      <div className="photo-banners">
        <div className="banner-slot studenti">
          <img src={studentiBanner} alt="Studenti pobeđuju" />
        </div>
        <div className="banner-slot masinci">
          <img src={masinciBanner} alt="Mašinci protiv mašinerije" />
        </div>
      </div>
      <div className="crowd" aria-hidden="true">
        <span className="crowd-member" />
        <span className="crowd-member" />
        <span className="crowd-member" />
        <span className="crowd-member" />
        <span className="crowd-member" />
      </div>
    </div>
  );
}

export type Pose =
  | "idle"
  | "whistle"
  | "water"
  | "uvreda"
  | "guranje"
  | "pretnja"
  | "gather"
  | "leave"
  | "retreat"
  | "dim";

export type PropKind = "whistle" | "banner" | "megaphone" | "bottle" | "none";

export type Place = "gate" | "night" | "road" | "hall" | "canopy";

export type ActionName = "attack" | "heal";

const STUDENT_POSES = new Set<Pose>(["whistle", "water", "retreat"]);
const ACTIVIST_POSES = new Set<Pose>(["uvreda", "guranje", "pretnja", "gather", "leave"]);

export const CLIP_MS: Record<Pose, number> = {
  idle: 0,
  whistle: 600,
  water: 700,
  uvreda: 600,
  guranje: 700,
  pretnja: 600,
  gather: 500,
  leave: 900,
  retreat: 800,
  dim: 600,
};

export function propForClass(name?: string): PropKind {
  if (name === "Mobilni tim") return "whistle";
  if (name === "Kontrolor") return "banner";
  if (name === "Govornica") return "megaphone";
  if (name === "Dežurna") return "bottle";
  return "whistle";
}

export function poseForAction(action: ActionName): Pose {
  if (action === "attack") return "whistle";
  return "water";
}

export function poseForEnemy(label?: string | null): Pose {
  if (label === "Guranje") return "guranje";
  if (label === "Pretnja") return "pretnja";
  if (label === "Sakuplja se") return "gather";
  return "uvreda";
}

export function poseOnStudent(clip: Pose): Pose {
  return STUDENT_POSES.has(clip) ? clip : "idle";
}

export function poseOnActivist(clip: Pose): Pose {
  return ACTIVIST_POSES.has(clip) ? clip : "idle";
}

export function placeForMission(id: string): Place {
  if (id === "nadstresnica") return "canopy";
  if (id === "plenum" || id === "izbori") return "hall";
  if (id === "upad") return "night";
  if (id === "mars-1" || id === "mars-2") return "road";
  return "gate";
}

export function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

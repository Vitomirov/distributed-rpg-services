export type EnemyAction = "attack" | "cast" | "heal";

export function pickEnemyAction(defenderFaith: number, defenderStrength: number, roll: number): EnemyAction {
  const bucket = ((roll % 10) + 10) % 10;

  if (defenderFaith <= 2) {
    if (bucket < 7) return "attack";
    if (bucket < 9) return "cast";
    return "heal";
  }

  if (defenderStrength >= 10) {
    if (bucket < 8) return "attack";
    if (bucket < 9) return "cast";
    return "heal";
  }

  if (bucket < 5) return "cast";
  if (bucket < 9) return "attack";
  return "heal";
}

export function enemyActionLabel(action: EnemyAction, defenderFaith: number, defenderStrength: number): string {
  if (action === "heal") return "Sakuplja se";
  if (action === "cast") return "Pretnja";
  if (defenderStrength >= 10 && defenderFaith > 2) return "Guranje";
  return "Uvreda";
}

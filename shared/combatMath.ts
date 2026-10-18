export function attackDamage(strength: number, agility: number): number {
  return strength + agility;
}

export function castDamage(intelligence: number): number {
  return intelligence * 2;
}

export function healAmount(faith: number): number {
  return faith;
}

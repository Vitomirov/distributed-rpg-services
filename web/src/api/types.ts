export type ClassTemplate = {
  health: number;
  strength: number;
  agility: number;
  intelligence: number;
  faith: number;
  attack: number;
  cast: number;
  heal: number;
};

export type GameClass = {
  id: string;
  name: string;
  description: string;
  template: ClassTemplate | null;
};

export type OwnedItem = {
  item?: {
    id: string;
    name: string;
    description?: string;
  };
};

export type Student = {
  id: string;
  name: string;
  health: number;
  strength: number;
  agility: number;
  intelligence: number;
  faith: number;
  characterClass?: { name: string; description: string };
  items?: OwnedItem[];
};

export type DuelView = {
  id: string;
  attackerId?: string;
  defenderId?: string;
  attackerName?: string;
  defenderName?: string;
  attackerHp?: number;
  defenderHp?: number;
  status: string;
  winnerId?: string | null;
  message?: string;
  enemyAction?: "attack" | "cast" | "heal";
  enemyLabel?: string;
};

export type Encounter = {
  id: string;
  name: string;
  template: string;
};

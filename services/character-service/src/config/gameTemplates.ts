import { attackDamage, castDamage, healAmount } from "@shared/combatMath";

export type StatBlock = {
  health: number;
  mana: number;
  baseStrength: number;
  baseAgility: number;
  baseIntelligence: number;
  baseFaith: number;
};

export type StudentClassTemplate = {
  id: string;
  name: string;
  description: string;
  stats: StatBlock;
  starterItemId: string;
};

export type GameItem = {
  id: string;
  name: string;
  description: string;
  bonusStrength?: number;
  bonusAgility?: number;
  bonusIntelligence?: number;
  bonusFaith?: number;
};

export type EncounterKey = "vredalo" | "batinas" | "funkcioner";

export type EncounterTemplate = {
  key: EncounterKey;
  namePrefix: string;
  stats: StatBlock;
  trophyItemId: string;
};

const MANA = 50;

export const STUDENT_CLASSES: StudentClassTemplate[] = [
  {
    id: "a4e1c0d1-0001-4000-8000-000000000001",
    name: "Mobilni tim",
    description: "Prvi stigne na trg. Zviždaljka i transparent stignu pre ostalih.",
    starterItemId: "b4e1c0d1-0002-4000-8000-000000000001",
    stats: { health: 100, mana: MANA, baseStrength: 8, baseAgility: 16, baseIntelligence: 8, baseFaith: 12 },
  },
  {
    id: "a4e1c0d1-0001-4000-8000-000000000002",
    name: "Kontrolor",
    description: "Drži red u koloni i telom pravi zid. Ne udara.",
    starterItemId: "b4e1c0d1-0002-4000-8000-000000000002",
    stats: { health: 100, mana: MANA, baseStrength: 16, baseAgility: 8, baseIntelligence: 6, baseFaith: 14 },
  },
  {
    id: "a4e1c0d1-0001-4000-8000-000000000003",
    name: "Govornica",
    description: "Vodi pesmu megafonom. Linija se drži zviždukom, bez udarca.",
    starterItemId: "b4e1c0d1-0002-4000-8000-000000000003",
    stats: { health: 100, mana: MANA, baseStrength: 6, baseAgility: 8, baseIntelligence: 16, baseFaith: 12 },
  },
  {
    id: "a4e1c0d1-0001-4000-8000-000000000004",
    name: "Dežurna",
    description: "Voda, zagrljaj i pravna pomoć. Vraća ekipu u stroj.",
    starterItemId: "b4e1c0d1-0002-4000-8000-000000000004",
    stats: { health: 100, mana: MANA, baseStrength: 6, baseAgility: 6, baseIntelligence: 8, baseFaith: 18 },
  },
];

export const ACTIVIST_CLASS = {
  id: "a4e1c0d1-0001-4000-8000-000000000005",
  name: "Aktivista",
  description: "SNS aktivista. Vređa i gura. Na početku je slabiji.",
};

export const GAME_ITEMS: GameItem[] = [
  {
    id: "b4e1c0d1-0002-4000-8000-000000000001",
    name: "Zviždaljka",
    description: "Za mobilni tim.",
    bonusAgility: 4,
  },
  {
    id: "b4e1c0d1-0002-4000-8000-000000000002",
    name: "Transparent",
    description: "Korupcija ubija.",
    bonusStrength: 4,
  },
  {
    id: "b4e1c0d1-0002-4000-8000-000000000003",
    name: "Megafon",
    description: "Da se pesma čuje.",
    bonusIntelligence: 4,
  },
  {
    id: "b4e1c0d1-0002-4000-8000-000000000004",
    name: "Flaša vode",
    description: "Čaša vode posle suzavca.",
    bonusFaith: 4,
  },
  {
    id: "b4e1c0d1-0002-4000-8000-000000000011",
    name: "Papirna zastavica",
    description: "Ispala mu kad se povukao.",
    bonusStrength: 2,
  },
  {
    id: "b4e1c0d1-0002-4000-8000-000000000012",
    name: "Ispuštena zviždaljka",
    description: "Ostala na trgu.",
    bonusAgility: 2,
  },
  {
    id: "b4e1c0d1-0002-4000-8000-000000000013",
    name: "Stranačka značka",
    description: "Funkcioner je više ne nosi.",
    bonusIntelligence: 2,
  },
];

export const ENCOUNTERS: Record<EncounterKey, EncounterTemplate> = {
  vredalo: {
    key: "vredalo",
    namePrefix: "Vredalo",
    trophyItemId: "b4e1c0d1-0002-4000-8000-000000000011",
    stats: { health: 100, mana: MANA, baseStrength: 4, baseAgility: 4, baseIntelligence: 3, baseFaith: 2 },
  },
  batinas: {
    key: "batinas",
    namePrefix: "Batinas",
    trophyItemId: "b4e1c0d1-0002-4000-8000-000000000012",
    stats: { health: 100, mana: MANA, baseStrength: 10, baseAgility: 4, baseIntelligence: 3, baseFaith: 3 },
  },
  funkcioner: {
    key: "funkcioner",
    namePrefix: "Funkcioner",
    trophyItemId: "b4e1c0d1-0002-4000-8000-000000000013",
    stats: { health: 100, mana: MANA, baseStrength: 6, baseAgility: 4, baseIntelligence: 10, baseFaith: 4 },
  },
};

export function systemUserId(): string {
  return process.env.SYSTEM_USER_ID || "00000000-0000-4000-8000-000000000001";
}

export function findStudent(classId: string): StudentClassTemplate | undefined {
  return STUDENT_CLASSES.find((student) => student.id === classId);
}

type StatInput = {
  health?: number;
  baseStrength?: number;
  baseAgility?: number;
  baseIntelligence?: number;
  baseFaith?: number;
};

export function combatStatsOmitted(body: StatInput): boolean {
  return (
    body.health === undefined &&
    body.baseStrength === undefined &&
    body.baseAgility === undefined &&
    body.baseIntelligence === undefined &&
    body.baseFaith === undefined
  );
}

export function resolveStudentTemplate(classId: string, body: StatInput): StatBlock | null {
  const student = findStudent(classId);
  if (!student || !combatStatsOmitted(body)) return null;
  return student.stats;
}

export function classPreview(student: StudentClassTemplate) {
  const { stats } = student;
  return {
    health: stats.health,
    strength: stats.baseStrength,
    agility: stats.baseAgility,
    intelligence: stats.baseIntelligence,
    faith: stats.baseFaith,
    attack: attackDamage(stats.baseStrength, stats.baseAgility),
    cast: castDamage(stats.baseIntelligence),
    heal: healAmount(stats.baseFaith),
  };
}

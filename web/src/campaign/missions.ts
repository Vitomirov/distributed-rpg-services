export type EncounterTemplate = "vredalo" | "batinas" | "funkcioner";

export type Mission = {
  id: string;
  title: string;
  body: string;
  kind: "story" | "duel";
  template?: EncounterTemplate;
  winCopy?: string;
};

export const MISSIONS: Mission[] = [
  {
    id: "nadstresnica",
    title: "Nadstrešnica",
    kind: "story",
    body: "Prvog novembra je pala nadstrešnica. Šesnaest života. Crvena tkanina na ruci je zbog njih. Danas ne pucaš. Držiš se sa ostalima.",
  },
  {
    id: "plenum",
    title: "Plenum",
    kind: "story",
    body: "Plenum je potvrdio ulogu. Mobilni tim, kontrolor, govornica ili dežurna — ista lista, ista stvar.",
  },
  {
    id: "blokada",
    title: "Prva blokada",
    kind: "duel",
    template: "vredalo",
    body: "Ispred fakulteta stoji aktivista. Vređa. Vas je više, i znate zašto ste tu. On je na početku slabiji.",
  },
  {
    id: "tisina",
    title: "Petnaest minuta",
    kind: "story",
    body: "U 11:52 ćutite petnaest minuta. Niko ne zviždi. Posle tišine, kolona opet diše.",
  },
  {
    id: "upad",
    title: "Noćni upad",
    kind: "duel",
    template: "batinas",
    body: "Noću dolazi batinaš. Gura. Ekipa se ne raspada i ne uzvraća pesnicom.",
  },
  {
    id: "mars-1",
    title: "Marš",
    kind: "duel",
    template: "vredalo",
    body: "Kolona ide peške. Prvi susret na putu je opet neko ko samo vređa.",
  },
  {
    id: "mars-2",
    title: "Marš, drugi susret",
    kind: "duel",
    template: "vredalo",
    body: "Drugi susret, isti tip čoveka. Moral se ne prenosi — ekipa se sabrala iznova.",
  },
  {
    id: "izbori",
    title: "Izbori 2026",
    kind: "duel",
    template: "funkcioner",
    winCopy: "Lista ulazi.",
    body: "Izborna noć 2026. Funkcioner je najbliži. Ako pesma i zid izdrže, lista ulazi.",
  },
];

export function findMission(id: string): Mission | undefined {
  return MISSIONS.find((mission) => mission.id === id);
}

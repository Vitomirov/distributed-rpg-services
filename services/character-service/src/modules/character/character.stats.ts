import { Character } from "../../entities/Character";

export function withCalculatedStats(character: Character) {
  let strength = character.baseStrength;
  let agility = character.baseAgility;
  let intelligence = character.baseIntelligence;
  let faith = character.baseFaith;

  const items = (character.items ?? []).map((charItem) => {
    const item = charItem.item;
    if (item) {
      strength += item.bonusStrength || 0;
      agility += item.bonusAgility || 0;
      intelligence += item.bonusIntelligence || 0;
      faith += item.bonusFaith || 0;
    }

    return {
      id: charItem.id,
      item: item
        ? {
            id: item.id,
            name: item.name,
            description: item.description,
            bonusStrength: item.bonusStrength,
            bonusAgility: item.bonusAgility,
            bonusIntelligence: item.bonusIntelligence,
            bonusFaith: item.bonusFaith,
          }
        : undefined,
    };
  });

  return {
    id: character.id,
    name: character.name,
    health: character.health,
    mana: character.mana,
    baseStrength: character.baseStrength,
    baseAgility: character.baseAgility,
    baseIntelligence: character.baseIntelligence,
    baseFaith: character.baseFaith,
    createdBy: character.createdBy,
    characterClassId: character.characterClassId,
    characterClass: character.characterClass
      ? {
          id: character.characterClass.id,
          name: character.characterClass.name,
          description: character.characterClass.description,
        }
      : undefined,
    items,
    strength,
    agility,
    intelligence,
    faith,
    calculatedStats: { strength, agility, intelligence, faith },
  };
}

import { AppDataSource } from "./db";
import { CharacterClass } from "../entities/CharacterClass";
import { Item } from "../entities/Item";
import { ACTIVIST_CLASS, GAME_ITEMS, STUDENT_CLASSES } from "./gameTemplates";

export async function seedDatabase() {
  console.log("SEED: Starting..."); 
  
  const classRepo = AppDataSource.getRepository(CharacterClass);
  const itemRepo = AppDataSource.getRepository(Item);

  // 1. Seed Generic Classes
  const class1Exists = await classRepo.findOneBy({ name: "Class1" });
  if (!class1Exists) {
    console.log("SEED: Inserting Class1 & Class2...");
    await classRepo.insert([
      { id: "69c56550-b39a-440a-a84f-830ca734cfb6", name: "Class1", description: "Generic Class One" },
      { id: "a1b2c3d4-e5f6-4012-8345-6789abcdef01", name: "Class2", description: "Generic Class Two" }
    ]);
  }

  // 2. Seed Generic Items
  const item1Exists = await itemRepo.findOneBy({ name: "Item1" });
  if (!item1Exists) {
    console.log("SEED: Inserting Item1 & Item2...");
    await itemRepo.insert([
      {
        id: "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
        name: "Item1",
        description: "Initial item for Character1",
        bonusIntelligence: 20,
        bonusFaith: 10
      },
      {
        id: "c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f",
        name: "Item2",
        description: "Initial item for Character2",
        bonusStrength: 20,
        bonusAgility: 5
      }
    ]);
  }

  const studentClasses = [...STUDENT_CLASSES, ACTIVIST_CLASS];
  for (const studentClass of studentClasses) {
    const exists = await classRepo.findOneBy({ name: studentClass.name });
    if (!exists) {
      await classRepo.insert({
        id: studentClass.id,
        name: studentClass.name,
        description: studentClass.description,
      });
    } else if (exists.description !== studentClass.description) {
      exists.description = studentClass.description;
      await classRepo.save(exists);
    }
  }

  for (const gameItem of GAME_ITEMS) {
    const exists = await itemRepo.findOneBy({ name: gameItem.name });
    if (!exists) {
      await itemRepo.insert({
        id: gameItem.id,
        name: gameItem.name,
        description: gameItem.description,
        bonusStrength: gameItem.bonusStrength ?? 0,
        bonusAgility: gameItem.bonusAgility ?? 0,
        bonusIntelligence: gameItem.bonusIntelligence ?? 0,
        bonusFaith: gameItem.bonusFaith ?? 0,
      });
    }
  }

  console.log("SEED: Finished!");
}
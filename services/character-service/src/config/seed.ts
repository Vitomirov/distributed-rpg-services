import { AppDataSource } from "./db";
import { CharacterClass } from "../entities/CharacterClass";
import { Item } from "../entities/Item";

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
  console.log("SEED: Finished!");
}
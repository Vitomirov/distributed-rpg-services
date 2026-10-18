import { Response } from "express";
import { QueryFailedError } from "typeorm";
import { AppDataSource } from "../../config/db";
import { ACTIVIST_CLASS, ENCOUNTERS, EncounterKey, systemUserId } from "../../config/gameTemplates";
import { Character } from "../../entities/Character";
import { CharacterClass } from "../../entities/CharacterClass";
import { Item } from "../../entities/Item";
import { AuthRequest } from "@shared/types";
import { grantItemToCharacter } from "../item/item.controller";

function isUniqueViolation(err: unknown): boolean {
  return err instanceof QueryFailedError && (err.driverError as { code?: string } | undefined)?.code === "23505";
}

// POST /api/character/encounter
export async function spawnEncounter(req: AuthRequest, res: Response) {
  try {
    const template = req.body?.template as EncounterKey;
    const spec = template ? ENCOUNTERS[template] : undefined;
    if (!spec) {
      return res.status(400).json({ message: "template must be vredalo, batinas, or funkcioner" });
    }

    const classRepo = AppDataSource.getRepository(CharacterClass);
    const itemRepo = AppDataSource.getRepository(Item);
    const activistClass = await classRepo.findOne({ where: { id: ACTIVIST_CLASS.id } });
    const trophy = await itemRepo.findOne({ where: { id: spec.trophyItemId } });
    if (!activistClass || !trophy) {
      return res.status(500).json({ message: "Game content is not seeded" });
    }

    const repo = AppDataSource.getRepository(Character);
    let character: Character | null = null;

    for (let attempt = 0; attempt < 3 && !character; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 6);
      const name = `${spec.namePrefix}-${suffix}`;
      try {
        character = await repo.save(
          repo.create({
            name,
            health: spec.stats.health,
            mana: spec.stats.mana,
            baseStrength: spec.stats.baseStrength,
            baseAgility: spec.stats.baseAgility,
            baseIntelligence: spec.stats.baseIntelligence,
            baseFaith: spec.stats.baseFaith,
            createdBy: systemUserId(),
            characterClassId: ACTIVIST_CLASS.id,
          })
        );
      } catch (err) {
        if (!isUniqueViolation(err) || attempt === 2) throw err;
      }
    }

    if (!character) return res.status(500).json({ message: "Could not spawn activist" });

    await grantItemToCharacter(character.id, spec.trophyItemId);

    return res.status(201).json({
      id: character.id,
      name: character.name,
      template: spec.key,
    });
  } catch (err) {
    console.error("SPAWN ENCOUNTER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

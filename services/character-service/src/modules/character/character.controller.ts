import { Response } from "express";
import { AppDataSource } from "../../config/db";
import { redisClient } from "../../config/redis";
import { findStudent, resolveStudentTemplate } from "../../config/gameTemplates";
import { Character } from "../../entities/Character";
import { AuthRequest } from "@shared/types";
import { grantItemToCharacter } from "../item/item.controller";
import { withCalculatedStats } from "./character.stats"; 

interface CreateCharacterInput {
  name: string;
  health?: number;
  mana?: number;
  baseStrength?: number;
  baseAgility?: number;
  baseIntelligence?: number;
  baseFaith?: number;
  characterClassId: string;
}

// POST /api/character
export async function createCharacter(req: AuthRequest, res: Response) {
  try {
    const { 
      name, 
      health, 
      mana, 
      baseStrength, 
      baseAgility, 
      baseIntelligence, 
      baseFaith, 
      characterClassId 
    } = req.body as CreateCharacterInput;
    
    if (!name) return res.status(400).json({ message: "Character name is required" });
    if (!characterClassId) return res.status(400).json({ message: "Character class ID is required" });

    const user = req.user;
    if (!user || !user.userId) {
      return res.status(401).json({ message: "Unauthorized: No user found in token" });
    }

    const repo = AppDataSource.getRepository(Character);
    
    const existing = await repo.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: "Character name already exists" });

    const template = resolveStudentTemplate(characterClassId, {
      health,
      baseStrength,
      baseAgility,
      baseIntelligence,
      baseFaith,
    });

    const character = repo.create({
      name,
      health: template?.health ?? health ?? 100,
      mana: mana ?? template?.mana ?? 50,
      baseStrength: template?.baseStrength ?? baseStrength ?? 10,
      baseAgility: template?.baseAgility ?? baseAgility ?? 10,
      baseIntelligence: template?.baseIntelligence ?? baseIntelligence ?? 10,
      baseFaith: template?.baseFaith ?? baseFaith ?? 10,
      createdBy: user.userId,
      characterClassId: characterClassId
    });

    await repo.save(character);

    if (template) {
      const student = findStudent(characterClassId);
      if (student) await grantItemToCharacter(character.id, student.starterItemId);
    }

    return res.status(201).json(character);
  } catch (err) {
    console.error("CREATE CHARACTER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/character
export async function getAllCharacters(req: AuthRequest, res: Response) {
  try {
    const user = req.user;

    if (!user || user.role !== 'GameMaster') {
      return res.status(403).json({ message: "Forbidden: Only Game Masters can list all characters" });
    }

    const repo = AppDataSource.getRepository(Character);
    
    const characters = await repo.find({
      select: {
        id: true,
        name: true,
        health: true,
        mana: true,
        baseStrength: true,
        baseAgility: true,
        baseIntelligence: true,
        baseFaith: true
      }
    });

    return res.json(characters);
  } catch (err) {
    console.error("GET ALL CHARACTERS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/character/mine
export async function getMyCharacters(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user?.userId) {
      return res.status(401).json({ message: "Unauthorized: No user found in token" });
    }

    const characters = await AppDataSource.getRepository(Character).find({
      where: { createdBy: user.userId },
      relations: ["characterClass", "items", "items.item"],
    });

    return res.json(characters.map(withCalculatedStats));
  } catch (err) {
    console.error("GET MY CHARACTERS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/character/:id
export async function getCharacterById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user;
    const cacheKey = `character:${id}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const repo = AppDataSource.getRepository(Character);
    
    const character = await repo.findOne({
      where: { id },
      relations: ["characterClass", "items", "items.item"] 
    });

    if (!character) return res.status(404).json({ message: "Character not found" });

    if (!user?.userId) {
      return res.status(401).json({ message: "Unauthorized: No user found in token" });
    }

    const result = withCalculatedStats(character);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    return res.json(result);
  } catch (err) {
    console.error("GET CHARACTER BY ID ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
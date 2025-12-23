import { Request, Response } from "express";
import axios from "axios";
import { AppDataSource } from "../../config/db";
import { Duel } from "../../entities/Duel";

const CHARACTER_SERVICE_URL = process.env.CHARACTER_SERVICE_URL;

export async function challenge(req: Request, res: Response) {
  const { attackerId, defenderId } = req.body;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization;

  try {
    // 1. SYNCHRONIZATION: Fetch stats for both characters from the Character Service
    const [aRes, dRes] = await Promise.all([
      axios.get(`${CHARACTER_SERVICE_URL}/character/${attackerId}`, { 
        headers: { Authorization: token } 
      }),
      axios.get(`${CHARACTER_SERVICE_URL}/character/${defenderId}`, { 
        headers: { Authorization: token } 
      })
    ]);

    const attacker = aRes.data;
    const defender = dRes.data;

    // 2. VALIDATION: Only the character owner can initiate a duel
    if (attacker.createdBy !== loggedInUserId) {
      return res.status(403).json({ message: "Only the character owner can initiate" });
    }

    // 3. DATABASE INITIALIZATION: Snapshot current stats into the Combat Database
    const repo = AppDataSource.getRepository(Duel);
    const newDuel = repo.create({
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerHp: attacker.health,
      defenderHp: defender.health,
      attackerStr: attacker.calculatedStats.strength,
      attackerAgi: attacker.calculatedStats.agility,
      attackerInt: attacker.calculatedStats.intelligence,
      attackerFaith: attacker.calculatedStats.faith,
      defenderStr: defender.calculatedStats.strength,
      defenderAgi: defender.calculatedStats.agility,
      defenderInt: defender.calculatedStats.intelligence,
      defenderFaith: defender.calculatedStats.faith,
      status: "IN_PROGRESS"
    });

    await repo.save(newDuel);
    res.status(201).json(newDuel);
  } catch (error) {
    res.status(400).json({ message: "Failed to initiate challenge. Check Character IDs." });
  }
}
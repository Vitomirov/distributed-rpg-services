import { Response } from "express";
import axios, { AxiosError } from "axios";
import { AppDataSource } from "../../config/db";
import { Duel } from "../../entities/Duel";
import { AuthRequest } from "@shared/types";

const CHARACTER_SERVICE_URL = process.env.CHARACTER_SERVICE_URL;

// Character data interface for responses
interface CharacterData {
  id: string;
  name: string;
  health: number;
  strength: number;
  agility: number;
  intelligence: number;
  faith: number;
  createdBy: string;
  items: any[];
}

// Helper function for item transfer
async function handleDuelEnd(winnerId: string, loserId: string, token: string) {
  try {
    if (!CHARACTER_SERVICE_URL) return;

    const characterUrl = `${CHARACTER_SERVICE_URL}/character/${loserId}`;
    
    // Fetch loser character data
    const loserRes = await axios.get<CharacterData>(characterUrl, {
      headers: { Authorization: token }
    });
    
    const items = loserRes.data.items;
    
    if (items && items.length > 0) {
      const randomItem = items[0];
      const itemId = randomItem.item?.id || randomItem.id;

      if (!itemId) return;

      const giftUrl = `${CHARACTER_SERVICE_URL}/items/gift`;
      await axios.post(giftUrl, {
        fromCharacterId: loserId,
        toCharacterId: winnerId,
        itemId: itemId
      }, { headers: { Authorization: token } });
      
      console.log(`SUCCESS: Item ${itemId} transferred`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Reward transfer failed!", error.response?.status);
    }
  }
}

// --- Controllers ---

// POST /api/challenge
export async function challenge(req: AuthRequest, res: Response) {
  const { attackerId, defenderId } = req.body;
  const loggedInUserId = req.user?.userId;
  const token = req.headers.authorization;

  try {
    const [aRes, dRes] = await Promise.all([
      axios.get<CharacterData>(`${CHARACTER_SERVICE_URL}/character/${attackerId}`, { headers: { Authorization: token } }),
      axios.get<CharacterData>(`${CHARACTER_SERVICE_URL}/character/${defenderId}`, { headers: { Authorization: token } })
    ]);

    const attacker = aRes.data;
    const defender = dRes.data;

    if (attacker.createdBy !== loggedInUserId) {
      return res.status(403).json({ message: "Only the character owner can initiate" });
    }

    const repo = AppDataSource.getRepository(Duel);
    const newDuel = repo.create({
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerName: attacker.name,
      defenderName: defender.name,      
      attackerUserId: attacker.createdBy,
      defenderUserId: defender.createdBy,
      attackerHp: attacker.health,
      defenderHp: defender.health,
      attackerStr: attacker.strength ?? 0,
      attackerAgi: attacker.agility ?? 0,
      attackerInt: attacker.intelligence ?? 0,
      attackerFaith: attacker.faith ?? 0,
      defenderStr: defender.strength ?? 0,
      defenderAgi: defender.agility ?? 0,
      defenderInt: defender.intelligence ?? 0,
      defenderFaith: defender.faith ?? 0,
      status: "IN_PROGRESS"
    });

    await repo.save(newDuel);
    return res.status(201).json(newDuel);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 400).json({ 
        message: "Character service error", 
        details: error.response?.data 
      });
    }
    return res.status(500).json({ message: "Internal error" });
  }
}

// POST /api/{duel_id}/attack
export async function attack(req: AuthRequest, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = req.user?.userId;
  const token = req.headers.authorization as string;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const duration = (new Date().getTime() - new Date(duel.createdAt).getTime()) / 1000 / 60;
    if (duration > 5) {
      duel.status = "DRAW";
      await repo.save(duel);
      return res.status(200).json({ message: "Duel ended in a draw", status: "DRAW" });
    }

    const isAttacker = duel.attackerUserId === loggedInUserId;
    const isDefender = duel.defenderUserId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    if (duel.lastAttackAt && now.getTime() - new Date(duel.lastAttackAt).getTime() < 1000) {
      return res.status(429).json({ message: "Attack on cooldown" });
    }

    let damage = isAttacker ? (duel.attackerStr + duel.attackerAgi) : (duel.defenderStr + duel.defenderAgi);

    if (isAttacker) {
      duel.defenderHp = Math.max (0, duel.defenderHp - damage);
    } 
    else duel.attackerHp = Math.max (0, duel.attackerHp - damage);

    duel.lastAttackAt = now;

    if (duel.attackerHp <= 0 || duel.defenderHp <= 0) {
      duel.status = "FINISHED";
      duel.winnerId = duel.attackerHp > 0 ? duel.attackerId : duel.defenderId;
      const loserId = duel.winnerId === duel.attackerId ? duel.defenderId : duel.attackerId;
      await handleDuelEnd(duel.winnerId, loserId, token);
    }

    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { 
    return res.status(500).json({ message: "Attack error" }); 
  }
}

// POST /api/{duel_id}/cast
export async function cast(req: AuthRequest, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = req.user?.userId;
  const token = req.headers.authorization as string;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const isAttacker = duel.attackerUserId === loggedInUserId;
    const isDefender = duel.defenderUserId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    if (duel.lastCastAt && now.getTime() - new Date(duel.lastCastAt).getTime() < 2000) {
      return res.status(429).json({ message: "Cast on cooldown" });
    }

    let damage = isAttacker ? duel.attackerInt * 2 : duel.defenderInt * 2;
    if (isAttacker) duel.defenderHp -= damage; else duel.attackerHp -= damage;

    duel.lastCastAt = now;

    if (duel.attackerHp <= 0 || duel.defenderHp <= 0) {
      duel.status = "FINISHED";
      duel.winnerId = duel.attackerHp > 0 ? duel.attackerId : duel.defenderId;
      const loserId = duel.winnerId === duel.attackerId ? duel.defenderId : duel.attackerId;
      await handleDuelEnd(duel.winnerId, loserId, token);
    }

    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { 
    return res.status(500).json({ message: "Cast error" }); 
  }
}

// POST /api/{duel_id}/heal
export async function heal(req: AuthRequest, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = req.user?.userId;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const isAttacker = duel.attackerUserId === loggedInUserId;
    const isDefender = duel.defenderUserId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    if (duel.lastHealAt && now.getTime() - new Date(duel.lastHealAt).getTime() < 2000) {
      return res.status(429).json({ message: "Heal on cooldown" });
    }

    let healAmount = isAttacker ? duel.attackerFaith : duel.defenderFaith;
    if (isAttacker) duel.attackerHp += healAmount; else duel.defenderHp += healAmount;

    duel.lastHealAt = now;
    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { 
    return res.status(500).json({ message: "Heal error" }); 
  }
}
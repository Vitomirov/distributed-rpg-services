import { Request, Response } from "express";
import axios from "axios";
import { AppDataSource } from "../../config/db";
import { Duel } from "../../entities/Duel";

const CHARACTER_SERVICE_URL = process.env.CHARACTER_SERVICE_URL;

// Helper function for item transfer - Winner receives a random item
async function handleDuelEnd(winnerId: string, loserId: string, token: string) {
  try {
    if (!CHARACTER_SERVICE_URL) {
      console.error("CHARACTER_SERVICE_URL is not defined");
      return;
    }

    // 1. Fetch character data (Loser)
    const characterUrl = `${CHARACTER_SERVICE_URL}/character/${loserId}`;
    console.log(`Check the inventory of loser: ${characterUrl}`);
    
    const loserRes = await axios.get(characterUrl, {
      headers: { Authorization: token }
    });
    
    const items = loserRes.data.items;
    
    if (items && items.length > 0) {
      const randomItem = items[0];
      const itemId = (randomItem.item && randomItem.item.id) ? randomItem.item.id : randomItem.id;

      if (!itemId) {
        console.log("Item ID not found in structure.");
        return;
      }

      // 2. Item Transfer
      const giftUrl = `${CHARACTER_SERVICE_URL}/items/gift`;
      console.log(`🎁 Transferring item ${itemId} to: ${giftUrl}`);

      await axios.post(giftUrl, {
        fromCharacterId: loserId,
        toCharacterId: winnerId,
        itemId: itemId
      }, { headers: { Authorization: token } });
      
      console.log(`SUCCESS: Item ${itemId} transferred from ${loserId} to ${winnerId}`);
    } else {
      console.log(`ℹKarakter ${loserId} nema itema za otimanje.`);
    }
  } catch (error: any) {
    console.error("Reward transfer failed!");
    console.error("Failed URL:", error.config?.url);
    console.error("Status:", error.response?.status || "Network error");
    if (error.response?.data) {
      console.error("Error details (from Character Service):", error.response.data);
    }
  }
}
//POST /api/challenge
export async function challenge(req: Request, res: Response) {
  const { attackerId, defenderId } = req.body;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization;

  try {
    console.log(`Duel Attempt: ${attackerId} vs ${defenderId}`);

    // 1. Fetch data for both characters in parallel
    const [aRes, dRes] = await Promise.all([
      axios.get(`${CHARACTER_SERVICE_URL}/character/${attackerId}`, { headers: { Authorization: token } }),
      axios.get(`${CHARACTER_SERVICE_URL}/character/${defenderId}`, { headers: { Authorization: token } })
    ]);

    const attacker = aRes.data;
    const defender = dRes.data;

    // 2. Ownership check (TASK: "only the character owner can initiate")
    if (attacker.createdBy !== loggedInUserId) {
      console.log("Ownership check failed");
      return res.status(403).json({ message: "Only the character owner can initiate" });
    }

    // 4. Create duel in the database
    const repo = AppDataSource.getRepository(Duel);
    const newDuel = repo.create({
      attackerId: attacker.id,
      defenderId: defender.id,
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
    console.log(`Duel ${newDuel.id} created!`);
    
    return res.status(201).json(newDuel);

  } catch (error: any) {
    console.error("Challenge failed error details:");
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      return res.status(error.response.status).json({ 
        message: "Character service error", 
        details: error.response.data 
      });
    } else {
      console.error(error.message);
      return res.status(400).json({ message: "Failed to initiate challenge.", error: error.message });
    }
  }
}
// POST /api/{duel_id}/attack
export async function attack(req: Request, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization as string;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    // If a duel exceeds 5 minutes, it ends in a draw
    const duration = (new Date().getTime() - new Date(duel.createdAt).getTime()) / 1000 / 60;
    if (duration > 5) {
      duel.status = "DRAW";
      await repo.save(duel);
      return res.status(200).json({ message: "Duel ended in a draw", status: "DRAW" });
    }

    // Restricted to duel participants
    const isAttacker = duel.attackerUserId === loggedInUserId;
    const isDefender = duel.defenderUserId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    // Available every second
    if (duel.lastAttackAt && now.getTime() - new Date(duel.lastAttackAt).getTime() < 1000) {
      return res.status(429).json({ message: "Attack on cooldown" });
    }

    // Inflicts damage based on strength + agility
    let damage = isAttacker ? (duel.attackerStr + duel.attackerAgi) : (duel.defenderStr + duel.defenderAgi);
    if (isAttacker) duel.defenderHp -= damage; else duel.attackerHp -= damage;

    duel.lastAttackAt = now;

    // End of combat check
    if (duel.attackerHp <= 0 || duel.defenderHp <= 0) {
      duel.status = "FINISHED";
      duel.winnerId = duel.attackerHp > 0 ? duel.attackerId : duel.defenderId;
      const loserId = duel.winnerId === duel.attackerId ? duel.defenderId : duel.attackerId;
      await handleDuelEnd(duel.winnerId, loserId, token);
    }

    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { return res.status(500).json({ message: "Attack error" }); }
}
// POST /api/{duel_id}/cast
export async function cast(req: Request, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization as string;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const isAttacker = duel.attackerUserId === loggedInUserId;
    const isDefender = duel.defenderUserId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    // Available every two seconds
    if (duel.lastCastAt && now.getTime() - new Date(duel.lastCastAt).getTime() < 2000) {
      return res.status(429).json({ message: "Cast on cooldown" });
    }

    // Inflicts damage based on 2 * intelligence
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
  } catch (err) { return res.status(500).json({ message: "Cast error" }); }
}
// POST /api/{duel_id}/heal
export async function heal(req: Request, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = (req as any).user.userId;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const isAttacker = duel.attackerUserId === loggedInUserId;
    const isDefender = duel.defenderUserId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    // Available every two seconds
    if (duel.lastHealAt && now.getTime() - new Date(duel.lastHealAt).getTime() < 2000) {
      return res.status(429).json({ message: "Heal on cooldown" });
    }

    // Restores health based on faith
    let healAmount = isAttacker ? duel.attackerFaith : duel.defenderFaith;
    if (isAttacker) duel.attackerHp += healAmount; else duel.defenderHp += healAmount;

    duel.lastHealAt = now;
    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { return res.status(500).json({ message: "Heal error" }); }
}
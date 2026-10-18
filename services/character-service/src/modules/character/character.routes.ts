import { Router } from "express";
import { createCharacter, getAllCharacters, getCharacterById, getMyCharacters } from "./character.controller";
import { spawnEncounter } from "./encounter.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();

router.post("/", jwtMiddleware, createCharacter);
router.post("/encounter", jwtMiddleware, spawnEncounter);
router.get("/", jwtMiddleware, getAllCharacters);
router.get("/mine", jwtMiddleware, getMyCharacters);
router.get("/:id", jwtMiddleware, getCharacterById);

export default router;

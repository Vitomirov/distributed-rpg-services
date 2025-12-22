import { Router } from "express";
import { createCharacter } from "./character.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();

router.post("/", jwtMiddleware, createCharacter); // POST /api/character

export default router;

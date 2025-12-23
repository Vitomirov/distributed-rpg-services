import { Router } from "express";
import { challenge } from "./combat.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();
router.post("/challenge", jwtMiddleware, challenge);
// Ovde ćemo dodati /attack, /cast, /heal u sledećem koraku

export default router;
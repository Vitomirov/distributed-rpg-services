import { Router } from "express";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";
import { listClasses } from "./class.controller";

const router = Router();

router.get("/", jwtMiddleware, listClasses);

export default router;

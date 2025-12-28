import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload, AuthRequest } from "@shared/types";

export const jwtMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Pristupamo headerima preko req.headers jer je AuthRequest prosireni Request
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET as string;
    
    // Verifikacija i cast-ovanje u nas JwtPayload koji sada ima ispravan 'role'
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Postavljanje user-a na request
    req.user = {
      userId: payload.userId,
      role: payload.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
// shared/types.ts
import type { Request } from "express";

export interface JwtPayload {
  userId: string;
  role: "User" | "GameMaster"; 
}

// Umesto da TypeScript sam nagađa odakle je Request, 
// koristimo ga direktno iz importa
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
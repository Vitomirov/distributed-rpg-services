import { Request } from "express";

export type UserRole = "User" | "GameMaster";

export interface JwtPayload {
  userId: string;
  role: UserRole; 
}

// Extended Request interface to include user property
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
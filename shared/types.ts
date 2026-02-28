// import { Request } from "express";

export enum UserRole {
  USER = "User",
  GAME_MASTER = "GameMaster"
}

export interface JwtPayload {
  userId: string;
  role: UserRole; 
}

// Extended Request interface to include user property
export type AuthRequest<P = any, B = any> = any & {
  user?: JwtPayload;
};
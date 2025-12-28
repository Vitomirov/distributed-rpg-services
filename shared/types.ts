import { Request } from "express";

export type UserRole = "User" | "GameMaster";

export interface JwtPayload {
  userId: string;
  role: UserRole; 
}

// Extended Request interface to include user property
export type AuthRequest<P = any, B = any> = Request<P, any, B> & {
  user?: JwtPayload;
};
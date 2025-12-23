import { DataSource } from "typeorm";
import { Duel } from "../entities/Duel";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [Duel],
  migrations: ["src/migrations/*.ts"],
});
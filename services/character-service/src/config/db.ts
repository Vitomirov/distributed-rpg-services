import "reflect-metadata";
import { DataSource } from "typeorm";
import { Character } from "../entities/Character";
import { CharacterClass } from "../entities/CharacterClass";
import { CharacterItem } from "../entities/CharacterItem";
import { Item } from "../entities/Item";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // Koristimo path.join da bi radilo i u lokalu i u Dockeru
  entities: [Character, CharacterClass, CharacterItem, Item],
// Putanja mora da izađe iz src/config i uđe u src/migrations
migrations: [path.join(__dirname, "..", "migrations", "*.ts")],
  migrationsTableName: "migrations",
  synchronize: false, // Isključeno jer koristimo migracije
  logging: true,
});

export async function initializeDB() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Character DB connected");
    }
  } catch (error) {
    console.error("Error during Data Source initialization", error);
    throw error;
  }
}
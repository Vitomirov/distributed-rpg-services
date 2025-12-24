import { DataSource } from "typeorm";
import { Duel } from "../entities/Duel";
import * as path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [Duel],
  migrations: [path.join(__dirname, "..", "migrations", "*{.ts,.js}")],
  migrationsTableName: "combat_migrations",
});

export async function initializeDB() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Combat Database has been initialized!");

      console.log("Running Combat migrations...");
      await AppDataSource.runMigrations();
      
      console.log("Combat DB Initialization complete");
    }
  } catch (error) {
    console.error("Error during Combat Data Source initialization", error);
    throw error;
  }
}
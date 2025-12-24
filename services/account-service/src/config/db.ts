import { DataSource } from "typeorm";
import { User } from "../entities/User";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  schema: "public",
  synchronize: false,
  logging: true,
  entities: [User],
migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
});

export async function initializeDB() {
  let retries = 5;
  while (retries) {
    try {
      await AppDataSource.initialize();
      console.log("Account DB connected");
      
      await AppDataSource.runMigrations();
      console.log("Account migrations executed");
      break;
    } catch (err) {
      console.error(`Error connecting to Account DB: ${err}. Retries left: ${retries}`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
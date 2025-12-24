import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
import { AppDataSource, initializeDB } from "./config/db";
import combatRoutes from "./modules/combat/combat.routes";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/combat", combatRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDB(); 

    app.listen(PORT, () => {
      console.log(`Combat Service is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error during Combat Service startup:", err);
    process.exit(1);
  }
}

startServer();
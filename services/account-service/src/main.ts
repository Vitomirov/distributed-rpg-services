import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import { initializeDB } from "./config/db";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

async function bootstrap() {
  await initializeDB();
  app.listen(Number(process.env.PORT), () => {
    console.log(`Account service running on port ${process.env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Service failed to start:", err);
  process.exit(1);
});

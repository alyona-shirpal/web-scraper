import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

import { newRoute } from './routes/new-route';
dotenv.config();

async function main(): Promise<void> {
  const app = express();
  app.use(express.json());
  app.use(cors());
  newRoute(app);

  app.listen(process.env.BACKEND_PORT, () => {
    console.info(
      `Server started at http://localhost:${process.env.BACKEND_PORT}`,
    );
  });
}

main().catch((err) => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});

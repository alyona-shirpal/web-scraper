import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

import { scraperRoute } from './routes/scraperRoute';

dotenv.config();

async function main(): Promise<void> {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.set('view engine', 'pug');
  app.use(express.static('public'));

  scraperRoute(app);

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

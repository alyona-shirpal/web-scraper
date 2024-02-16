import type * as express from 'express';

import { ScrapeRozetkaService } from '../services/scrape-rozetka.service';
import { getPrismaClient } from '../../prisma/script';

export const scraperRoute = (app: express.Application): void => {
  app.get('/scraper', async (_req, res) => {
    try {
      const scrapeRozetkaService = ScrapeRozetkaService.getInstance();

      await scrapeRozetkaService.scrapeItems();
      res.send('OK');
    } catch (err) {
      console.error(err);
    }
  });

  app.get('/get-items', async (req, res) => {
    const prisma = getPrismaClient();

    const cards = await prisma.product.findMany();

    res.render('index', { cards });
  });
};

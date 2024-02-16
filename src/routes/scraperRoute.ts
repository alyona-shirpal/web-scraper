import type * as express from 'express';

import { ScrapeRozetkaService } from '../services/scrape-rozetka.service';

export const scraperRoute = (app: express.Application): void => {
  app.get('/scraper', async (_req, res) => {
    try {
      console.log('qwertyu');
      const scrapeRozetkaService = ScrapeRozetkaService.getInstance();

      await scrapeRozetkaService.scrapeItems();
      res.send('OK');
    } catch (err) {
      console.error(err);
    }
  });
};

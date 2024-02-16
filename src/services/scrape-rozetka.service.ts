import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { getPrismaClient } from '../../prisma/script';
import type { IProduct } from '../types/product.interface';

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: false }));

export class ScrapeRozetkaService {
  private static instance: ScrapeRozetkaService;

  static getInstance(): ScrapeRozetkaService {
    if (!this.instance) {
      this.instance = new ScrapeRozetkaService();
    }
    return this.instance;
  }

  async scrapeItems() {
    const prisma = getPrismaClient();
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const baseUrl = 'https://bt.rozetka.com.ua/ua/washing_machines/c80124/';
    const maxItems = 500;
    let products = [];

    try {
      await page.goto(baseUrl);
      await this.autoScroll(page);
      let currentPage = 1;

      while (products.length < maxItems) {
        const data = await this.extractItems(page);

        console.log(`Extracted ${data.length} items from page ${currentPage}`);
        products = [...products, ...data];

        if (products.length >= maxItems) {
          break;
        }

        const hasNextPage = await this.goToNextPage(page, baseUrl, currentPage);

        if (hasNextPage) {
          await this.autoScroll(page);
          console.log('Completed auto-scrolling.');
        } else {
          break;
        }

        currentPage++;
      }

      for (const product of products) {
        await prisma.product.create({ data: product });
      }

      console.log(`All done ✨. Total products scraped: ${products.length}`);
    } catch (e) {
      console.error('Scraping error:', e);
    } finally {
      await page.close();
      await browser.close();
    }
  }

  private async goToNextPage(page, baseUrl, currentPage): Promise<boolean> {
    const url = `${baseUrl}page=${currentPage}/`;
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 40000 }); // Increased timeout to 60 seconds

      const nextButton = await page.$('.pagination__direction--forward');
      if (!nextButton) {
        console.log('No more pages to scrape.');
        return false;
      }

      await nextButton.click();

      await page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 40000,
      });

      return true;
    } catch (e) {
      console.error('Navigation error:', e);
      return false;
    }
  }

  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 1000);
      });
    });
  }

  private async extractItems(page): Promise<IProduct[]> {
    await page.waitForSelector(
      '.catalog-grid.ng-star-inserted .catalog-grid__cell.catalog-grid__cell_type_slim.ng-star-inserted:last-child',
    );

    const items: IProduct[] = await page.evaluate(async () => {
      const liElements = document.querySelectorAll(
        '.catalog-grid.ng-star-inserted .catalog-grid__cell.catalog-grid__cell_type_slim.ng-star-inserted',
      );

      const dataPromises = Array.from(liElements).map(async (li) => {
        const imgElement = li.querySelector(
          '.goods-tile__picture img.ng-lazyloaded',
        ) as HTMLImageElement | null;

        if (!imgElement) {
          return null;
        }

        const imgPromise = new Promise<string>((resolve) => {
          if (imgElement.complete) {
            resolve(imgElement.src);
          } else {
            imgElement.onload = () => resolve(imgElement.src);
          }
        });

        const img = await imgPromise;

        const title =
          li.querySelector('.goods-tile__title')?.textContent?.trim() || '';

        const price =
          li.querySelector('.goods-tile__price-value')?.textContent?.trim() ||
          '';

        const source = li.querySelector(
          '.goods-tile__picture',
        ) as HTMLAnchorElement;

        return {
          imgUrl: img,
          title,
          price,
          source: source.href,
          type: 'rozetka',
        };
      });

      const data = await Promise.all(dataPromises);

      return data.filter((item) => item !== null);
    });

    return items;
  }
}

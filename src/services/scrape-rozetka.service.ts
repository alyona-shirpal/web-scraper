import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import puppeteer from 'puppeteer-extra';

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

export class ScrapeRozetkaService {
  private static instance: ScrapeRozetkaService;

  static getInstance(): ScrapeRozetkaService {
    if (!this.instance) {
      this.instance = new ScrapeRozetkaService();
    }
    return this.instance;
  }

  async scrapeItems() {
    puppeteer.use(StealthPlugin());

    puppeteer.use(AdblockerPlugin({ blockTrackers: false }));

    puppeteer.launch({ headless: 'new' }).then(async (browser) => {
      const page = await browser.newPage();

      const baseUrl = 'https://bt.rozetka.com.ua/ua/washing_machines/c80124/';

      await page.goto(baseUrl);

      const products = [];

      const maxItems = 20;

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
          }, 100);
        });
      });

      let currentPage = 1;

      while (products.length < maxItems) {
        // @ts-ignore
        await page.waitForSelector(
          '.catalog-grid.ng-star-inserted .catalog-grid__cell.catalog-grid__cell_type_slim.ng-star-inserted:last-child',
        );

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        const data = await page.evaluate(async () => {
          const liElements = document.querySelectorAll(
            '.catalog-grid.ng-star-inserted .catalog-grid__cell.catalog-grid__cell_type_slim.ng-star-inserted',
          );

          const items = [];

          for (const li of liElements) {
            const imgElement = li.querySelector(
              '.goods-tile__picture img.ng-lazyloaded',
            ) as HTMLImageElement | null;

            if (!imgElement) {
              continue;
            }

            const img = await new Promise((resolve) => {
              if (imgElement.complete) {
                resolve(imgElement.src);
              } else {
                imgElement.onload = () => resolve(imgElement.src);
              }
            });

            const title =
              li.querySelector('.goods-tile__title')?.textContent?.trim() || '';
            const price =
              li
                .querySelector('.goods-tile__price-value')
                ?.textContent?.trim() || '';

            items.push({ img, title, price });
          }

          return items;
        });

        products.push(...data);

        const url = `${baseUrl}page=${currentPage}/`;

        console.log(url);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 40000 });

        // @ts-ignore
        const nextButton = await page.$('.pagination__direction--forward');
        if (!nextButton) {
          await page.close();
          console.log('No more pages to scrape.');
          break;
        }

        await nextButton.click();
        await page.waitForNavigation({
          waitUntil: 'networkidle0',
          timeout: 40000,
        });

        currentPage++;
      }

      await page.close();
      console.log('All done ✨');
      console.log(products.length);

      console.log(products);
      await browser.close();
    });
  }
}

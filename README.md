# Web Scraper Project

This project is a web scraper built with Puppeteer to extract data from the [bt.rozetka.com.ua](https://bt.rozetka.com.ua) website. The extracted data is stored in a PostgresSQL database using the Prisma ORM.

## Setup

### Prerequisites

- Node.js installed
- Docker installed

### Installation

1. Clone the repository
2. Install dependencies
   ```sh
   npm install 


### Start PostgresSQL container
`` docker pull postgres``

``` docker run --name postgres-container -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres ```

### Configuration
 1. .env file in the root directory
 2. Add the following environment variables:
   - DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   - BACKEND_PORT


### Running the Scraper
To start the scraper, run:
``` npm run dev```


## Usage
### Scraping Data
Send a GET request to` /scraper` to start the scraping process.

### Viewing Scraped Data
Send a GET request to` /get-items` to view the scraped data.

#!/usr/bin/env node

const { writeFileSync } = require('fs');
const GetSitemapLinks = require('get-sitemap-links').default;
const cliProgress = require('cli-progress');
const crawler = require('crawler');

const cliProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const crawl = new crawler({
    maxConnections: 1,
    rateLimit: 1000,
    retries: 2,
    retryTimeout: 10000,
    followRedirect: false,
});

const crawlerPromise = (url) => {
    const options = { uri: url };

    return new Promise((resolve, reject) => {
        options.callback = async (err, res, done) => {
            if (err) {
                reject(err);
            } else {
                const data = { url: res.options.uri, status: res.statusCode };

                cliProgressBar.increment();

                resolve(data);
            }
            done();
        };

        crawl.queue(options);
    });
};

(async () => {
    if (process.argv.length < 3) {
        console.log('You must provide a sitemap url to crawl, i.e. yarn crawl https://example.com/sitemap.xml');
        return;
    }

    try {
        const sitemapUrl = process.argv[2];
        const sitemapUrls = await GetSitemapLinks(sitemapUrl);
        const crawlPromises = [];

        console.log(`Starting crawl of ${sitemapUrl} containing: ${sitemapUrls.length} urls`);

        cliProgressBar.start(sitemapUrls.length, 0);

        let dataToWrite = '';

        dataToWrite += `PageUrl, Status\n`;

        await new Promise((resolve) => {
            sitemapUrls.forEach((url) => {
                resolve(crawlPromises.push(crawlerPromise(url)));
            });
        });

        const crawlResults = Array.from(new Set([...(await Promise.all(crawlPromises))])).filter(Boolean);

        cliProgressBar.stop();

        crawlResults.forEach((result) => {
            dataToWrite += `${result.url}, ${result.status}\n`;
        });

        writeFileSync('./output/sitemap-response.csv', dataToWrite, 'utf8');

        console.log('Crawl complete, results written to output/sitemap-response.csv');
    } catch (error) {
        console.error('Invalid sitemap error:', error);
        return;
    }
})();

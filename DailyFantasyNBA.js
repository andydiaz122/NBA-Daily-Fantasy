// const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer';

async function scrapeNBAStats() {
    // Launch puppetter browser
    const browser = await puppeteer.launch({ headless: true, slowMo: 100 });
    const page = await browser.newPage()

    // Go to the NBA.com player stats page
    await page.goto('https://www.nba.com/stats/leaders?');
    console.log('Page Loaded');
    
/************************************************************ 
    // Wait for all network activity to finish
    await page.waitForNetworkIdle({ timeout: 60000 });

    // Wait for the table to load (the main content takes time)
    await page.waitForSelector('.Crom_table__p1iZz');
    console.log('Table Loaded'); 
******************************************************************/

    // Wait for the stats table to load
    try { 
        await page.waitForSelector('.Crom_table__p1iZz', { timeout: 6000 });
        console.log('Table Loaded');
    } catch (error) {
        console.error('Table did not load within timeout', error);
    }
    
    // Extract the data from the page
    const stats = await page.evaluate(() => {
        //    const rows = Array.from(document.querySelectorAll('.Crom_table__p1iZz'));
            const rows = Array.from(document.querySelectorAll('.Crom_body__UYOcU tbody tr'));
        // const rows = Array.from(document.querySelectorAll('Crom_table__p1iZz table tbody tr'));
        // console.log(rows.entries);
            return rows.map(row => {
                const columns = row.querySelector('td');
                return {
                    rank: columns[0]?.innerText,     // Rank
                    player: columns[1]?.innerText,   // Player name
                    team: columns[2]?.innerText,    // Team
                    pts: columns[3]?.innerText,     // Points
                    fg_percentage: columns[4]?.innerText,   // FG%
                    fgm: columns[5]?.innerText,     // Field goals made
                    fga: columns[6]?.innerText,     // Field goal attempts
                    minutes: columns[7]?.innerText,     // Minutes played
                    rebounds: columns[8]?.innerText,    // Rebounds
                };
        });
    });

    // Output the extracted player stats to the console
    console.log('hello');
    console.log(stats);
  

    //Close the browser
    await browser.close();
}


scrapeNBAStats().catch(console.error);


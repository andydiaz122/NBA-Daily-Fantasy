// const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer';

async function scrapeNBAStats() {
    // Launch puppetter browser
    const browser = await puppeteer.launch({ headless: true, slowMo: 100 });
    const page = await browser.newPage()

    // Go to yahoo!sports NBA player stats page
    await page.goto('https://sports.yahoo.com/nba/players/5658/');
    console.log('Page Loaded');
    
    // Wait for the stats table to load
    try { 
        await page.waitForSelector('table.table.graph-table', { timeout: 6000 });
        console.log('Table Loaded');
    } catch (error) {
        console.error('Table did not load within timeout', error);
    }
    
    // Extract the data from the page
    const stats = await page.evaluate(() => {
        const rows = document.querySelectorAll('.table.graph-table tbody tr');
        console.log(rows);
        const get_player_name = Array.from(document.querySelectorAll('div.IbBox h1 span.ys-name')).map(span => span.innerText); // get player name
        console.log(get_player_name);

        return Array.from(rows).map(row => {
            const columns = row.querySelectorAll('td');
            return {
                player: get_player_name.join(),  // Player name
                date: columns[0]?.innerText,    // Date of game
                opp: columns[1]?.innerText,    // Opponent
                score: columns[2]?.innerText,  // Game score
                min: columns[4]?.innerText,    // Minutes played
                pts: columns[23]?.innerText,     // Points
                fgm: columns[5]?.innerText,     // Field goals made
                fga: columns[6]?.innerText,     // Field goal attempts
                fg_percentage: columns[7]?.innerText,   // FG%
                reb: columns[16]?.innerText,    // Rebounds

            };
        });
    });

    // Output the extracted player stats to the console
    console.log(stats);
  
    //Close the browser
    await browser.close();
}


scrapeNBAStats().catch(console.error);
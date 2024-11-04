import puppeteer, { trimCache } from 'puppeteer';
import fs from 'fs';

async function scrapeNBAStats(url) {
    // Launch puppetter browser
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage()

    // Go to yahoo!sports NBA player STATS page
    await page.goto(url, { timeout: 60000 });   // sets a 60sec timeout
    
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
                score: columns[2]?.innerText,  // Game score
                min: columns[4]?.innerText,    // Minutes played
                pts: columns[23]?.innerText,     // Points
                fgm: columns[5]?.innerText,     // Field goals made
                fga: columns[6]?.innerText,     // Field goal attempts
                fg_percentage: columns[7]?.innerText,   // FG%
                reb: columns[16]?.innerText,    // Rebounds
                ast: columns[17]?.innerText,    // Assists
                opp: columns[1]?.innerText,    // Opponent
                date: columns[0]?.innerText,    // Date of game
            };
        });
    });

     //Close the browser
     await browser.close();

    // Output the extracted player stats to the console
    let trimmed_stats = stats.slice(0,4); 
    trimmed_stats = trimmed_stats.flat(Infinity);
    // console.log(trimmed_stats);

    // Conduct analysis on the stats:
    // Save the players that are trending upward in atleast 3 stats from the most recent 4 games played
    // Helper function to convert minutes (format 'MM:SS') to decimal 
    function convertMinutes(minStr) {
        const [minutes, seconds] = minStr.split(':').map(Number);
        return minutes + seconds / 60;
    }

    // Conduct analysis on the stats:
    // Save the players that are trending upward in atleast 3 stats from the most recent 4 games played
    function ParseStats(stats) {
        // Save the stats for each game in an array
        // Perform basic subtraction: (stats of most recent 2 games) - (stats from the other 2 games) = number
        // if number is positive, then player is trending upward
        
        let trendingGames = [];
        // Loop through the last three pairs of games (comparing game n to game n-1)
    /*    for(let i = 0; i < stats.length - 1; i++) {
            let upwardTrends = 0;
            let trendingStats = [];

            if(+stats[i].pts > +stats[i + 1].pts) {
                upwardTrends++;
                trendingStats.push('pts');
            }
            if(+stats[i].fg_percentage > +stats[i + 1].fg_percentage) {
                upwardTrends++;
                trendingStats.push('fg_percentage');
            }
            if(+stats[i].fga > +stats[i + 1].fga) {
                upwardTrends++;
                trendingStats.push('fga');
            }
            if(+stats[i].min > +stats[i + 1].min) {
                upwardTrends++;
                trendingStats.push('min');
            }
            if(+stats[i].reb > +stats[i + 1].reb) {
                upwardTrends++;
                trendingStats.push('reb');
            }
            if(+stats[i].ast > +stats[i + 1].ast) {
                upwardTrends++;
                trendingStats.push('ast');
            }

            // Store if at least three stats are trending upwards 
            if (upwardTrends >= 3) {
                trendingGames.push({ game: i, trendingStats });
            }
        }
    */    
        let upwardTrends = 0;
        let trendingStats = [];

        if (stats.length > 0 && typeof stats[0].pts !== 'undefined') {
            if(((+stats[0].pts) + (+stats[1].pts)) / 2 > ((+stats[2].pts) + (+stats[3].pts)) / 2) {
                upwardTrends++;
                trendingStats.push('pts');
            }
            if(((+stats[0].fg_percentage) + (+stats[1].fg_percentage)) / 2 > ((+stats[2].fg_percentage) + (+stats[3].fg_percentage)) / 2) {
                upwardTrends++;
                trendingStats.push('fg_percentage');
            }
            if(((+stats[0].fga) + (+stats[1].fga)) / 2 > ((+stats[2].fga) + (+stats[3].fga)) / 2) {
                upwardTrends++;
                trendingStats.push('fga');
            }
            if(((+stats[0].min) + (+stats[1].min)) / 2 > ((+stats[2].min) + (+stats[3].min)) / 2) {
                upwardTrends++;
                trendingStats.push('min');
            }
            if(((+stats[0].reb) + (+stats[1].reb)) / 2 > ((+stats[2].reb) + (+stats[3].reb)) / 2) {
                upwardTrends++;
                trendingStats.push('reb');
            }
            if(((+stats[0].ast) + (+stats[1].ast)) / 2 > ((+stats[2].ast) + (+stats[3].ast)) / 2) {
                upwardTrends++;
                trendingStats.push('ast');
            }
        }
        else {
            return 0;
        }


        // Store if at least three stats are trending upwards 
        if (upwardTrends >= 3) {
            console.log(trendingStats);
            return trendingStats;
        }
        else {
            return trendingGames;
        }

    }

    const trendingGames = ParseStats(trimmed_stats);
    if(trendingGames == 0) {
        return "Not valid"
    }
    if (trendingGames.length >= 2) {
        console.log(`${trimmed_stats[0].player}`);
    // trendingGames.forEach(game => {
    //    console.log(`Game ${game.game}: Trending Stats - ${game.trendingStats.join(', ')}`);
    //});
    } else {
       // console.log('Player is not trending upward in enough stats.');
    }

    return trimmed_stats; 
}
 
// List of Player IDs. Extracted from 'ScrapePlayerID.js' and stored locally for runtime and testing efficiency
const data = fs.readFileSync('data.json', 'utf-8');
const global_player_id_list = JSON.parse(data);

// Helper functon to create a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}    
/* Get data from every single player. First access the player id and insert it in the url.
Go through each url respectively and store data store player data  */ 
await (async () => {
    // Go to yahoo!sports NBA individual player page 
    const place_holder_url = 'https://sports.yahoo.com/nba/players/place_holder/';     // (this url does NOT work)

    // Parse through each player's url and store stats
    // replace 'place_holder' in url with player id number 
    let player_url = "";
    let stats = [];
    let dummy_holder = [];
    for (let i = 0; i < global_player_id_list.length; i += 10) {
        const batch = global_player_id_list.slice(i, i + 10).map(async (id_num) => {
            player_url = place_holder_url.replace('place_holder', id_num);
            dummy_holder = scrapeNBAStats(player_url);
            return dummy_holder;
        });


        // Await the results of the batch and concatenate them to `stats`
        const batch_Results = await Promise.all(batch);
        stats = stats.concat(...batch_Results);

        // Delay after every batch to avoid overwhelming requests
        console.log(`Processed players ${i + 1} to ${i + 10}, delaying for 18 seconds`);
        await delay(18000);  // 18-second delay
    }
 /*   global_player_id_list.forEach(myFunction);
    function myFunction(id_num) {
        player_url = place_holder_url.replace('place_holder', id_num);
        dummy_holder = scrapeNBAStats(player_url);
        stats.concat(dummy_holder);
    }
*/
})();

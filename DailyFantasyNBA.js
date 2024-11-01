import puppeteer from 'puppeteer';

async function scrapePlayerIds(url) {
    // Launch puppetter browser
    const browser = await puppeteer.launch({ headless: true, slowMo: 100 });
    const page = await browser.newPage();

    // Go to yahoo!sports NBA TEAM ROSTER page 
    await page.goto('https://sports.yahoo.com/nba/players/5658/');
    console.log('Page Loaded'); 

    // Extract the player id's from the page
    const player_id_num = await page.evaluate(() => {
        const rows = document.querySelectorAll('table.W tbody tr td div div a');
        console.log(rows); 
        const href_holder = Array.from(document.querySelectorAll('tbody tr td div div a')).map(anchor => anchor.href);    // href contains the player ids
        console.log(href_holder);
        return href_holder;
    });

    //Close the browser
    await browser.close();

    return player_id_num;
}
   
async function scrapeNBAStats() {
    // Launch puppetter browser
    const browser = await puppeteer.launch({ headless: true, slowMo: 100 });
    const page = await browser.newPage()

    // Go to yahoo!sports NBA player STATS page
    await page.goto('https://sports.yahoo.com/nba/players/5658/');
    console.log('Page Loaded');
    
    // Wait for the stats table to load
    try { 
        await page.waitForSelector('table.table.graph-table');
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

    // Output the extracted player stats to the console
    console.log(stats.slice(0,4));
  
    //Close the browser
    await browser.close();
}

/****  First we need to get the individual player IDs so we can parse through each rostered player's url 
        Ex url: https://sports.yahoo.com/nba/teams/atlanta/roster/
        Replace 'atlanta' with each team      *****/
const global_player_ids = await (async () => {
    // create a table with all the city names of each NBA team 
    const teams = ['atlanta', 'boston', 'brooklyn', 'charlotte', 'chicago', 'cleveland', 'detroit', 
        'indiana', 'miami', 'milwaukee', 'new-york', 'orlando', 'philadelphia', 'toronto', 'washington',
        'dallas', 'denver', 'golden-state', 'houston', 'los-angeles', 'memphis', 'minnesota', 'new-orleans',
        'oklahoma-city', 'phoenix', 'portland', 'sacramento', 'san-antonio', 'utah'];

    // Go to yahoo!sports NBA team ROSTER page 
    const place_holder_url = 'https://sports.yahoo.com/nba/teams/place_holder/roster/';     // (this url does NOT work)

    // Parse through each team's url and grab each rostered player's id
    // replace 'place_holder' in url with each city
    let roster_url = "";
    const team_url_list = [];
    teams.forEach(myFunction);
    function myFunction(city) {
        roster_url = place_holder_url.replace('place_holder', city);
        team_url_list.push(roster_url);   // store all the url's in an array
    }

    let all_Player_Ids = [];
    for (const url of team_url_list) {
        const team_hrefs = await scrapePlayerIds(url);
        const player_Id = team_hrefs
                            .filter(url => url.includes('/players'))    // Keep only URLs that contain '/players/'
                            .map(url => url.match(/players\/(\d+)\//)?.[1]) // Extract the player ID numbers
                            .filter(Boolean);               // Remove any `null` or `undefined` values
        all_Player_Ids = all_Player_Ids.concat(player_Id);
    }

    console.log("All Player IDs: ", all_Player_Ids);
    console.log(`There were: ${all_Player_Ids.length} ID numbers found`);

    return all_Player_Ids;
})();       // Immediately Invoked Function Expression 

/* Get data from every single player. First access the player id and insert it in the url.
Go through each url respectively and store data store player data  */ 
const global_player_stats = await (async () => {
    // Go to yahoo!sports NBA individual player page 
    const place_holder_url = 'https://sports.yahoo.com/nba/players/place_holder/';     // (this url does NOT work)

    // Parse through each playe's url and store stats
    // replace 'place_holder' in url with player id number 
    let player_url = "";
    global_player_ids.forEach(myFunction);
    function myFunction(id_num) {
        player_url = place_holder_url.replace('place_holder', id_num);
        console.log(id_num);
        // scrapeNBAStats(player_url).catch(console.error);
    }

    // scrapeNBAStats().catch(console.error);
})();


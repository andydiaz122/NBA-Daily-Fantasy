import puppeteer from 'puppeteer';

async function scrapePlayerIds(url) {
    // Launch puppetter browser
    const browser = await puppeteer.launch({ headless: true, slowMo: 100 });
    const page = await browser.newPage();

    // Go to yahoo!sports NBA TEAM ROSTER page 
    await page.goto(url);
    // await page.goto('https://sports.yahoo.com/nba/players/5658/');
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
    teams.forEach(myFunction1);
    function myFunction1(city) {
        roster_url = place_holder_url.replace('place_holder', city);
        team_url_list.push(roster_url);   // store all the url's in an array
    }
    console.log(team_url_list);

    let all_Player_Ids = [];
    for (const url of team_url_list) {
        const team_hrefs = await scrapePlayerIds(url);
        const player_Ids = team_hrefs
                            .filter(url => url.includes('/players'))    // Keep only URLs that contain '/players/'
                            .map(url => url.match(/players\/(\d+)\//)?.[1]) // Extract the player ID numbers
                            .filter(Boolean);               // Remove any `null` or `undefined` values
        all_Player_Ids = all_Player_Ids.concat(player_Ids);
    }

    all_Player_Ids.forEach(myFunction2);
    function myFunction2(player_id) {
        console.log(player_id);
    }

    // console.log("All Player IDs: ", all_Player_Ids);
    console.log(`There were: ${all_Player_Ids.length} ID numbers found`);

    return all_Player_Ids;
})();       // Immediately Invoked Function Expression 
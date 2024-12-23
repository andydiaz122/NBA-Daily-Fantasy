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

        if (stats.length > 0 && typeof stats[0].pts !== 'undefined' && typeof stats[1].pts !== 'undefined' && typeof stats[2].pts !== 'undefined' && typeof stats[3].pts !== 'undefined') {
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
// const data = fs.readFileSync('data.json', 'utf-8');
// const global_player_id_list = JSON.parse(data);
const global_player_id_list = [/* 6791,
    5338,
    10105,
    5336,
    6698,
    10069,
    6166,
    6562,
    6429,
    10073,
    6259,
    5487,
    6398,
    10296,
    6713,
    10053,
    6016,
    5155,
    5602,
    6743,
    6619,
    4622,
    4245,
    5903,
    10206,
    5464,
    6418,
    6581,
    10277,
    6570,
    5765,
    6427,
    10075,
    10321,
    5842,
    4913,
    6219,
    10121,
    10396,
    5693,
    6173,
    6563,
    10134,
    6741,
    6065,
    5187,
    6571,
    5600,
    6569,
    6604, 
    10111,
    6552,
    10077,
    6395,
    6023,
    5245,
    6733,
    4631,
    6410,
    6276,
    6560,
    6224,
    5363,
    10104,
    6803,
    6434,
    10295,
    10323,
    10120,
    6705,
    6210,
    5764,
    10265,
    6043,
    5893,
    6580,
    6555,
    6548,
    6234,
    5324,
    6731,
    10083,
    10126,
    6402,
    6651,
    6708,
    4897,
    6169,
    6396,
    5835,
    10066,
    6167,
    6212,
    5651,
    6452,
    5826,
    6514,
    5681,
    6397,   
    10145, 
    6267,
    4884,
    6579,
    6746,
    10279,
    6256,
    5650,
    6512,
    6703,
    6766,
    5194,
    4901,
    10263,
    6695,
    10316,
    10331,
    6716,
    6450,
    10114,
    6408,
    6799,
    10096,
    6749,
    10324,
    10305,
    6404,
    6564,
    6776,
    4621,
    6696,
    5582,
    6721,
    6406,
    10318,
    10113,
    5658,
    6400,
    5471,
    10103,
    6356,
    5827,
    5855,
    4893,
    4912,
    6566,
    6175,
    6155,
    10092,
    10311,  
    6717,
    10312,
    4391,
    5500,
    6073,
    5476,
    6652,
    10274,
    5185,
    6714,
    5501,
    6755,
    10082,
    10300,
    5012,
    10088,
    4472,
    5073,
    5482,
    5643,
    10227,
    6734,
    10262,
    6048,
    6782,
    5480,
    6412,
    5836,
    6021,
    6044,
    10297,
    5843,
    10317,
    10314,
    6578,
    10303,
    5474,
    6047,
    6600,
    10129,
    5432,
    6407,
    6691,
    6206,
    10095,
    5159,
    6018,
    10275,
    5330,
    6722,   
    10106,
    5768,
    4911,
    6628,
    6500,
    6516,
    6550,
    6036,
    10335,
    10125,
    6636,
    5015,
    10310,
    5294,
    4725,
    4469,
    4906,
    4152,
    6275,
    6444,
    6413,
    10276,
    5475,
    6750,
    5647,
    6704,
    6515,
    6165,
    10391,
    5894,
    6053,
    6625,
    10325,
    10101,
    6222,
    6551,
    10330,
    5164,
    5640,
    6417,
    10333,
    4682,
    10278,
    5959,
    6718,
    6411,
    5667,
    6582,
    10273,
    6632,   
    10099,
    6700,
    10272, 
    6471,
    5497,
    6557,
    5840,
    6216,
    10294,
    4886,
    10078,
    5349,
    6014,
    6586,
    5316,
    6226,
    10223,
    6567,
    6727,
    4840,
    5892,
    10097,
    6499,
    4894,
    5356,
    10116,
    4892,
    6174,
    6679,
    10385,
    6711,
    5295,
    10329,
    10286,
    5352,
    10393,
    4497,
    5638,
    6414,
    10074,
    6025,
    10112,
    10067,
    6720,
    4390,
    5862,
    5323,
    5341,
    10332,
    4612,
    5069,
    5637,
    10080,
    6549,
    5490,
    6057,
    6556,
    5739,
    10115,
    10308,
    6745,
    6772,
    6687,
    5292,
    5163,
    5858,
    10328,
    6707,
    4247,
    6513,
    6034,
    6614,
    10389,
    10288,
    6693,
    6463,
    10108,
    5727,
    10118,
    6806,
    6558,
    6572,
    6422,
    10147,
    6209,
    10287,
    6617,
    10070,
    6015,
    10415,
    5825,
    6255,
    6709,
    6164,
    6757,
    5317,
    10327,
    10340,
    6737,   
    6205,
    10086,
    4246,
    6028,
    10281,
    5886,
    10387,
    6355,
    6594,
    5197,
    5393,
    6420,
    10050,
    6735,
    6626,
    5318,
    6253,
    10280,
    6613,
    6593,
    6801,
    6269,
    10098,
    5601,
    10220,
    6577,
    6742,
    5161,
    10289,
    6559,
    5660,
    10338,
    6574,
    5880,
    6163,
    5754,
    6701,
    6254,
    10343,
    10244,
    6022,
    5856,
    6692,
    6441,
    10284,
    10411,
    10304,
    10301,
    10107,
    6597,
    6702,
    6724,
    6076,
    6032,
    5009,
    6232,
    5473,
    10309,
    10292,
    4244,
    6751,
    10313,
    5484,
    5733,
    5864,
    5327,
    5905,
    6031,
    5192,
    6719,
    6401, 
    5958,
    6588,
    10065,
    10285,
    5350,
    10048,
    6730,
    10061,
    10234,
    10119,
    10164,
    10064,
    6697,
    6035,
    6208,
    6747,
    6038,
    10293,
    10320, 
    4614, */
    6753,
    5767,
    6030,
    10087,
    10341,
    6453,
    5156,
    5472,
    5322,
    6133,
    5824,
    6694,
    6802,
    5642,
    5013,
    6595,
    6710,
    10290,
    6754,
    10051,
    5823,
    6624,
    10336,
    6217,
    6433,
    6596,
    10367,
    3930,
    6699,
    6403,
    10094,
    6715,
    5357,
    10282,
    5832,
    6109,
    10315,
    10100,
    10110,
    6762,
    6712,
    5769,
    4660,
    6058,
    6655,
    6575,
    10122,
    6019,
    10127,   
    10283];

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

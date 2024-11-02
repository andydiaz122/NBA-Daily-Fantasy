const c_williams = [
    {
      player: 'Cody Williams',
      score: 'L 106-88',
      min: '23:37',
      pts: '2',
      fgm: '0',
      fga: '6',
      fg_percentage: '0.0',
      reb: '5',
      ast: '2',
      opp: 'SA',
      date: 'Oct 31'
    },
    {
      player: 'Cody Williams',
      score: 'L 113-96',
      min: '29:50',
      pts: '9',
      fgm: '3',
      fga: '7',
      fg_percentage: '42.9',
      reb: '0',
      ast: '2',
      opp: 'SAC',
      date: 'Oct 29'
    },
    {
      player: 'Cody Williams',
      score: 'L 102-110',
      min: '15:48',
      pts: '2',
      fgm: '1',
      fga: '5',
      fg_percentage: '20.0',
      reb: '4',
      ast: '0',
      opp: '@DAL',
      date: 'Oct 28'
    },
    {
      player: 'Cody Williams',
      score: 'L 127-86',
      min: '25:12',
      pts: '2',
      fgm: '1',
      fga: '6',
      fg_percentage: '16.7',
      reb: '3',
      ast: '2',
      opp: 'GS',
      date: 'Oct 25'
    }
  ];

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
    for(let i = 1; i < stats.length; i++) {
        let upwardTrends = 0;
        let trendingStats = [];

        if(+stats[i].pts > +stats[i - 1].pts) {
            upwardTrends++;
            trendingStats.push('pts');
        }
        if(+stats[i].fg_percentage > +stats[i - 1].fg_percentage) {
            upwardTrends++;
            trendingStats.push('fg_percentage');
        }
        if(+stats[i].fga > +stats[i - 1].fga) {
            upwardTrends++;
            trendingStats.push('fga');
        }
        if(+stats[i].min > +stats[i - 1].min) {
            upwardTrends++;
            trendingStats.push('min');
        }
        if(+stats[i].reb > +stats[i - 1].reb) {
            upwardTrends++;
            trendingStats.push('reb');
        }
        if(+stats[i].ast > +stats[i - 1].ast) {
            upwardTrends++;
            trendingStats.push('ast');
        }

        // Store if at least three stats are trending upwards 
        if (upwardTrends >= 3) {
            trendingGames.push({ game: i, trendingStats });
        }
    }
    
    return trendingGames;
}


const trendingGames = ParseStats(c_williams);
if (trendingGames.length >= 2) {
    console.log('Player is trending upward in 3+ stats in at least two recent games.');
  trendingGames.forEach(game => {
    console.log(`Game ${game.game}: Trending Stats - ${game.trendingStats.join(', ')}`);
  });
} else {
    console.log('Player is not trending upward in enough stats.');
}
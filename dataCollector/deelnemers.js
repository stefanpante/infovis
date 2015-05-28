var fs = require('fs');

var data = fs.readFileSync('data.json');

data = JSON.parse(data);

var drivers = data.drivers;


var bestOfYears = {};

for(key in drivers){
    var career = drivers[key].career;
    for(var i = 0; i < career.length; i++){
        var season = career[i];
        var year = career[i].year;
        if(!(year in bestOfYears)){
            bestOfYears[year] = {
                bestWins: season.wins,
                driverWins: key,
                bestPoints: season.points,
                driverPoints: key,
            }
        }
        
        var best = bestOfYears[year];
        
        if(season.wins > best.bestWins){
            bestOfYears[year].bestWins = season.wins;
            bestOfYears[year].bestWinsPoints = season.points;
            bestOfYears[year].driverWins = key;
        }
        
        if(season.points > best.bestPoints){
            bestOfYears[year].bestPoints = season.points;
            bestOfYears[year].bestPointsWins = season.wins;
            bestOfYears[year].driverPoints = key;
        }
    }
}

var different = []
for(key in bestOfYears){
    var best = bestOfYears[key];
    if(best.driverPoints != best.driverWins){
        best.year = key;
        different.push(best);
    }
}

console.log(different.length);
console.log(different);


// deelnemers per jaar met wins

//var years = {}
//for(key in drivers){
//    var career = drivers[key].career;
//    for(var i = 0; i < career.length; i++){
//        var year = career[i].year;
//        if(!(year in years)){
//            years[year] = [];
//        }
//        
//        if(career[i].wins > 0){
//            years[year].push(key);
//        }
//    }
//    
//}
//
//// bereken het max aantal deelnemers met wins in een jaar
//var maxDeelnemers = 0;
//var minDeelnemers = 800;
//var averageDeelnemers = 0;
//var nbYears = 0;
//var yearsLength = [];
//
//for(year in years){
//    yearsLength.push(years[year].length);
//    averageDeelnemers += years[year].length;
//    maxDeelnemers = Math.max(maxDeelnemers, parseInt(years[year].length));
//    minDeelnemers = Math.min(minDeelnemers, parseInt(years[year].length));
//    nbYears++;
//}
//
//console.log(yearsLength);
//averageDeelnemers /= nbYears;
//console.log("averageDeelnemers: " + averageDeelnemers);
//console.log("minDeelnemers: " + minDeelnemers);
//console.log("maxDeelnemers: " + maxDeelnemers);


//var constructors = data.constructors;
//var averageConstructors = 0;
//var minConstructors = 7000;
//var maxConstructors = 0;
//var nbKeys = 0;
//var consLengths = [];
//for(key in constructors){
//    var length = constructors[key].length;
//    nbKeys++; 
//    averageConstructors += length;
//    minConstructors = Math.min(minConstructors, length);
//    maxConstructors = Math.max(maxConstructors, length);
//    consLengths.push(length);
//    
//}
//
//console.log("averageConstructors: " + averageConstructors / nbKeys);
//console.log("minConstructors: " + minConstructors);
//console.log("maxConstructors: " + maxConstructors);
//console.log(consLengths);

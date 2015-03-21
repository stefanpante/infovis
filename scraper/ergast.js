var fs = require('fs');
var http = require('http');
var Q = require('q');

var base_url = "http://ergast.com/api/f1/";
var result = {};
var seasons = null;


function getSeasons(callback) {
    http.get(base_url + "seasons.json?limit=70&offset=0", function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        })

        res.on('end', function () {
            var data = JSON.parse(body);
            seasons = data.MRData.SeasonTable.Seasons;
            //d.resolve(seasons);
            callback();
        })
    })
    
    
}

function getDriverStandings(callback) {
    // promises
    //var ts = [];
    for (var i = 0; i < seasons.length; i++) {
        //var d = Q.defer();
        //ts.push(d.promise);
        var season = seasons[i];
        http.get(base_url + season.season + "/driverStandings.json", function (res) {
            var body = '';

            res.on('data', function (chunk) {
                body += chunk;
            })

            res.on('end', function () {
                var data = JSON.parse(body);
                var year = data.MRData.StandingsTable.season
                result[year] = {};
                result[year].drivers = {};
                var driverStandings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                //console.log(driverStandings);
                for (var j = 0; j < driverStandings.length; j++) {
                    var driverID = driverStandings[j].Driver.driverId;
                    console.log(driverID);
                    result[year].drivers[driverID] = {
                        first_name: driverStandings[j].Driver.givenName,
                        last_name: driverStandings[j].Driver.familyName,
                        wins: driverStandings[j].wins,
                        constructor: driverStandings[j].Constructors[0].constructorId
                    }
                }
                //console.log("Driver standings finished");
                //d.resolve(true);
                callback();
            });
        });

    }
    //return Q.all(ts);

}

function getConstructorStandings(callback) {
    // promises
    //var ts = [];
    for (var i = 0; i < seasons.length; i++) {
        //var d = Q.defer();
        //ts.push(d.promise);
        var season = seasons[i];
        http.get(base_url + season.season + "/constructorStandings.json", function (res) {
            var body = '';

            res.on('data', function (chunk) {
                console.log("data");
                body += chunk;
            })

            res.on('end', function () {
                var data = JSON.parse(body);
                var year = data.MRData.StandingsTable.season;
                if (year > 1957) {
                    
                    result[year] = {};
                    result[year].constructors = {};
                    console.log(year);
                    var constructorStandings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
                    
                    for (var j = 0; j < constructorStandings.length; j++) {
                        var constructorID = constructorStandings[j].Constructor.constructorId;
                        console.log(constructorID);
                        result[year].constructors[constructorID] = {
                            Constructor: constructorStandings[j].Constructor,
                            wins: constructorStandings[j].wins
                        }
                    }
                    if(year > 2008){
                     callback();   
                    }
                    

                }
                //d.resolve();
            });
        });

    }

    //return Q.all(ts);

}




function writeResults(name) {
    console.log("Writing results");
    fs.writeFile(name, JSON.stringify(result), 'utf8', function (err) {
        if (err) throw err;
        console.log("results saved to file")
    })
}

getSeasons(function(){
    getConstructorStandings(function(){
        writeResults("constructors.json");
    });
});
//.then(getConstructorStandings)
// to write the file
var fs = require('fs');

// we needed sync method to prevent timeout
var request = require('sync-request');

// promises to force synchronous behaviour
var Q = require('q');

// base url of the api
var base_url = "http://ergast.com/api/f1/";

// convenience variables
var seasons = null;
var driverStandings = {};
var constructors = {};
var constructorStandings = {};
var result = {};


/*
 * Gets all the seasons inside the API.
 */
function getSeasons() {
    var d = Q.defer();
    console.log("get seasons");
    var res = request('GET', base_url  + "seasons.json?limit=70&offset=0");
    var json = JSON.parse(res.getBody());
    seasons = json.MRData.SeasonTable.Seasons;
    
    d.resolve();
    return d.promise;
}

/*
 * get the driver standings from 1960 onwards (inconsistent state before 1960)
 */
function getDriverStandings() {
    var d = Q.defer();

    for (var i = 0; i < seasons.length; i++) {
        var season = seasons[i];
        if (season.season > 1959) {
            
            console.log("getting Driver Standings for the season of " + season.season);
            var res = request('GET', base_url + season.season + "/driverStandings.json");
            var json = JSON.parse(res.getBody());
            driverStandings[season.season] = json.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        }
    }

    d.resolve();

    return d.promise;

}

/*
 * get the constructor standings from 1960 onwards (inconsistent state before 1960)
 */
function getConstructorStandings() {
    var d = Q.defer();
    for (var i = 0; i < seasons.length; i++) {
        var season = seasons[i];
        if (season.season > 1959) {
            console.log("Getting Constructor Standings for the season of " + season.season);
            var res = request('GET', base_url + season.season + "/constructorstandings.json");
            var json = JSON.parse(res.getBody());
            constructorStandings[season.season] = json.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        }
    }
    fs.writeFile("constructorStandings.json", JSON.stringify(constructorStandings), 'utf8', function (err) {
        if (err) throw err;
        console.log("results saved to file")
    })

    d.resolve();

    return d.promise;

}


/*
 * Convert the driver standings into a more driver centric form, more convenient for us.
 */
function createDrivers(){
    var d = Q.defer();
    
    var drivers = {};
    for( key in driverStandings){
        var yearStanding = driverStandings[key];
        for(var i = 0; i < yearStanding.length; i++){
            // Get all relevant driver data
            var driver = yearStanding[i].Driver;
            var name = driver.givenName + " " + driver.familyName;
            var driverId = driver.driverId;
            // get all relevant constructor data
            var constructor = yearStanding[i].Constructors[0].constructorId;
            var wins = yearStanding[i].wins;
            
            //create the relevant data object.
            if(!drivers[driverId]) drivers[driverId] = {};
            drivers[driverId].name = name;
            drivers[driverId].driverId = driverId;
            if(!drivers[driverId].career) drivers[driverId].career = {}
            drivers[driverId].career[key] = {
                constructorId: constructor,
                wins: wins
            };
        }

    }
    
    result.drivers = drivers;
    
    d.resolve();
    return d.promise;
}

/*
 * Convert the constructor standings into a more conventient constructor centric form.
 */
function createConstructor(){
    var d = Q.defer();
    var constructors = {};
    for (key in constructorStandings){
        var yearStanding = constructorStandings[key];
        for(var i = 0; i < yearStanding.length; i++){
            //get constructor data
            var constructor = yearStanding[i].Constructor;
            var constructorId = constructor.constructorId;
            var name = constructor.name;
            // get the wins of the constructor
            var wins = yearStanding[i].wins;
            
            if(!constructors[constructorId]) constructors[constructorId] = {};
            constructors[constructorId].constructorId = constructorId;
            constructors[constructorId].name = name;
            if(!constructors[constructorId].career) constructors[constructorId].career = {};
            constructors[constructorId].career[key] = {
                wins: wins
            }
        }
    }
    
    result.constructors = constructors;
    d.resolve();
    return d.promise
}

/*
 * Write our results to a file.
 */
function writeResults(name) {
    console.log("Writing results");
    fs.writeFile("data.json", JSON.stringify(result), 'utf8', function (err) {
        if (err) throw err;
        console.log("results saved to file")
    })
}


/*
 * Execute the data collection.
 */
Q.fcall(getSeasons)
    .then(getDriverStandings)
    .then(getConstructorStandings)
    .then(createDrivers)
    .then(createConstructor)
    .then(writeResults).done();
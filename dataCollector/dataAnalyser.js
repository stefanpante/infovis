var fs = require('fs');

// read in our data set
var data = fs.readFileSync('data.json');
data = JSON.parse(data);

// get the number of drivers
var numDrivers = Object.keys(data.drivers).length;

console.log("number of drivers: " + numDrivers);

var constructors = extractConstructors();
// get the number of constructors
var numConstructors = constructors.length;
console.log("number of constructors: " + numConstructors);

var drivers = getStatisticsDrivers();

var maxWinsInSeason = 0;
var maxPointsInSeason = 0;

var bestPointsDriver = GetBestDriverByProperty(drivers, "points");
var bestWinsDriver = GetBestDriverByProperty(drivers, "wins");
// more data about drivers





careers = []
minCareerLength = 50;
maxCareerLength = -1;
averageCareerLength = 0;
for (var i = 0; i < drivers.length; i++) {
    var driver = drivers[i];
    if(driver.totalPoints > 0){
        var length  = parseInt(driver.career.length);
        minCareerLength = Math.min(minCareerLength, length);
        if( length == 14) console.log("14 " + driver.name);
        if( length == 15) console.log("15 " + driver.name);
        maxCareerLength = Math.max(maxCareerLength, length);
        averageCareerLength += length;
        careers.push(length);
    }
    

}

averageCareerLength /= 329;

console.log("Average Career length: " + averageCareerLength);
console.log("min Career length: " + minCareerLength);
console.log("max Career length: " + maxCareerLength);
console.log(careers);
//
////console.log(bestPointsDriver);
////console.log(bestWinsDriver);
//
//
//var averagePoints = 0;
//var averageWins = 0;
//
//for (var i = 0; i < drivers.length; i++) {
//    averagePoints += drivers[i].totalPoints;
//    averageWins += drivers[i].totalWins;
//}
//
//var winsDriver = [];
//var pointsDriver = [];
//for (var i = 0; i < drivers.length; i++) {
//    if (drivers[i].totalPoints == 0) {
//        nbDriversNoPoints++;
//    } else {
//        pointsDriver.push(drivers[i].totalPoints);
//    }
//    if (drivers[i].totalWins == 0) {
//        nbDriversNoWins++;
//    } else {
//        winsDriver.push(drivers[i].totalWins);
//    }
//
//    maxWins = Math.max(maxWins, drivers[i].totalWins);
//    maxPoints = Math.max(maxPoints, drivers[i].totalPoints);
//}
//
//var averagePointsWithPoints = averagePoints / (numDrivers - nbDriversNoPoints);
//
//var averageWinsWithWins = averageWins / (numDrivers - nbDriversNoWins);
//averagePoints /= drivers.length;
//averageWins /= drivers.length;
//
//winsDriver = [];
//pointsDriver = [];
//
//for (var i = 0; i < drivers.length; i++) {
//    var career = drivers[i].career;
//    for (var j = 0; j < career.length; j++) {
//        if (career[j].wins > 0) {
//            winsDriver.push(career[j].wins);
//        }
//        if (career[j].points > 0) {
//            pointsDriver.push(career[j].points);
//        }
//
//    }
//}
//fs.writeFileSync('boxplots.json', JSON.stringify({
//    winsDriver: winsDriver,
//    pointsDriver: pointsDriver
//}));
//
//
//console.log("average Wins all drivers: " + averageWins);
//console.log("average Points all drivers: " + averagePoints);
//
//console.log("average Wins only winning drivers: " + averageWinsWithWins);
//console.log("average Points only point scoring drivers: " + averagePointsWithPoints);
//
//var nbDriversNoWins = 0;
//var nbDriversNoPoints = 0;
//var maxWins = 0;
//var maxPoints = 0;
//
//
//
////var pointDis = [];
////
////for (var i = 0; i <= maxWins; i++) {
////    pointDis[i] = [i, 0];
////}
////for (var i = 0; i < drivers.length; i++) {
////    var driver = drivers[i];
////    pointDis[driver.totalWins][1] += 1;
////}
////
////fs.writeFile('pointDist.json', JSON.stringify({
////    points: pointDis}));
//console.log("Number of drivers with zero points over entire career:" + nbDriversNoPoints);
//console.log("Number of drivers with zero wins over entire career:" + nbDriversNoWins);
//console.log("Most Wins by one driver over career:" + maxWins);
//console.log("Most Points by one driver over career:" + maxPoints);
//console.log("Most Wins in one season:" + maxWinsInSeason);
//console.log("Most Points in one season:" + maxPointsInSeason);
//
//
//
function extractDriverStatistics(dr) {
    var career = dr.career;
    var totalPoints = 0;
    var totalWins = 0;
    careerDuration = career.length;
    for (var i = 0; i < career.length; i++) {
        totalPoints += parseInt(career[i].points);
        totalWins += parseInt(career[i].wins);
    }

    var averagePoints = totalPoints / career.length;
    var averageWins = totalWins / career.length;

    dr.careerDuration = careerDuration;
    dr.totalPoints = totalPoints;
    dr.totalWins = totalWins;
    dr.averageWins = averageWins;
    dr.averagePoints = averagePoints;

    return dr;

}


function extractConstructors() {
    var constructors = [];
    for (key in data.constructors) {
        var year = data.constructors[key];
        for (var i = 0; i < year.length; i++) {
            var constructorId = year[i].constructorId;
            if (constructors.indexOf(constructorId) < 0) {
                constructors.push(constructorId);
            }
        }

        return constructors;
    }
}

function getStatisticsDrivers() {
    var drivers = [];
    for (key in data.drivers) {
        var driver = extractDriverStatistics(data.drivers[key]);
        drivers.push(driver);

    }

    return drivers;
}

function GetBestDriverByProperty(drivers, property) {

    var maxProperty = 0;
    var maxPropertyDriver = null;

    for (var i = 0; i < drivers.length; i++) {
        var driver = drivers[i];
        var prop = extractMaxProperty(driver, property);
        if (maxProperty <= prop) {
            maxProperty = prop;
            maxPropertyDriver = driver;
            driver["max" + property] = prop;
        }
    }

    return maxPropertyDriver;
}

function extractMaxProperty(driver, property) {
    var career = driver.career;
    var maxProperty = 0;
    var name = driver.name;
    var bestYear = 0;
    for (var i = 0; i < career.length; i++) {
        var year = career[i];
        if (year[property] >= maxProperty) {
            maxProperty = Math.max(maxProperty, year[property]);
            bestYear = year.year;
        }

    }

    return maxProperty;
}
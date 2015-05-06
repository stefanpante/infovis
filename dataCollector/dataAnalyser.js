var fs = require('fs');

// read in our data set
var data = fs.readFileSync('data.json');
data = JSON.parse(data);

// get the number of drivers
var numDrivers = Object.keys(data.drivers).length;

console.log("number of drivers: " + numDrivers);

var constructors = [];

// get the number of constructors
for(key in data.constructors){
    var year = data.constructors[key];
    for(var i = 0; i < year.length; i++){
        var constructorId = year[i].constructorId;
        if(constructors.indexOf(constructorId) < 0){
            constructors.push(constructorId);
        }
    }
}

var numConstructors = constructors.length;

console.log("number of constructors: " + numConstructors);

var drivers = [];

var maxWinsInSeason = 0;
var maxPointsInSeason = 0;

// more data about drivers
for(key in data.drivers){
    var driver = extractDriverStatistics(data.drivers[key]);
    drivers.push(driver);
    
    var maxWinsDriver = extractMaxProperty(data.drivers[key], "wins");
    maxWinsInSeason = Math.max(maxWinsInSeason, maxWinsDriver);
    
    var maxPointsDriver = extractMaxProperty(data.drivers[key], "points");
    maxPointsInSeason = Math.max(maxPointsInSeason, maxPointsDriver)
    
}


var averagePoints = 0;
var averageWins = 0;

for(var i = 0; i < drivers.length; i++){
    averagePoints += drivers[i].totalPoints;
    averageWins += drivers[i].totalWins;
}

averagePoints /= drivers.length;
averageWins /= drivers.length;


console.log("average Wins: " + averageWins);
console.log("average Points: " + averagePoints);

var nbDriversNoWins = 0;
var nbDriversNoPoints = 0;
var maxWins = 0;
var maxPoints = 0;

for(var i = 0; i < drivers.length; i++){
    if(drivers[i].totalPoints == 0){
        nbDriversNoPoints++;
    }
    if(drivers[i].totalWins == 0){
        nbDriversNoWins++;
    }
    
    maxWins = Math.max(maxWins, drivers[i].totalWins);
    maxPoints = Math.max(maxPoints, drivers[i].totalPoints);
}

console.log("Number of drivers with zero points over entire career:" + nbDriversNoPoints);
console.log("Number of drivers with zero wins over entire career:" + nbDriversNoWins);
console.log("Most Wins by one driver over career:" + maxWins);
console.log("Most Points by one driver over career:" + maxPoints);
console.log("Most Wins in one season:" + maxWinsInSeason);
console.log("Most Points in one season:" + maxPointsInSeason);



function extractDriverStatistics(dr){
    var career = dr.career;
    var totalPoints = 0;
    var totalWins = 0;
    careerDuration = career.length;
    for(var i = 0 ; i< career.length; i++){
        totalPoints += parseInt(career[i].points);
        totalWins   += parseInt(career[i].wins);
    }
    
    var averagePoints = totalPoints / career.length;
    var averageWins = totalWins / career.length;
    
    return {
        name: dr.name,
        careerDuration: careerDuration,
        totalPoints: totalPoints,
        totalWins: totalWins,
        averageWins: averageWins,
        averagePoints: averagePoints
    }
    
}

function extractMaxProperty(driver, property){
    var career = driver.career;
    var maxProperty = 0;
    for(var i = 0; i < career.length; i++){
        var year = career[i];
        maxProperty = Math.max(maxProperty, year[property]);
    }
    
    return maxProperty;
}
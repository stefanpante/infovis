function makeIdsComplete(constructors) {
    var newConstructors = constructors;
    //get max number ids
    var max = 0;
    for (var i = 0; i < constructors.length; i++) {
        var tempYear = constructors[i];
        for (var j = 0; j < tempYear.length; j++) {
            var tempLength = tempYear[j].ids.length;
            max = Math.max(tempLength, max);
        }
    }

    for (var i = 0; i < newConstructors.length; i++) {

        var tempYear = newConstructors[i];
        for (var j = 0; j < tempYear.length; j++) {

            var tempLength = tempYear[j].ids.length;
            for (var k = 0; k < max - tempLength; k++) {
                tempYear[j].ids.push({
                    "driver": "none",
                    "metric": 0
                });
            }
        }
    }
    return newConstructors;
}


function newConstructorDataTypes(year, constructors, drivers) {

    var constructors2 = [];
    for (var i = 0; i < constructors.length; i++) {
        var t = constructors[i];
        t["ids"] = getDrivers(year, t.constructorId, drivers);
        constructors2.push(t);
    }

    return constructors2;
}

//More than 2 drivers possible as ids-values (arrays)
function newConstructorDataTypesAdvanced(year, constructors, drivers, metric) {

    var constructors2 = [];
    for (var i = 0; i < constructors.length; i++) {
        var t = constructors[i];
        t["ids"] = getDriversAdvanced(year, t.constructorId, drivers, metric);
        var sumMetric = getSumMetric(t);
        t["sumMetric"] = sumMetric;
        constructors2.push(t);
    }
    console.log(constructors2);
    return constructors2;
}

function fill_career_advanced(min, max, career) {
    var interval = max + 1 - min;
    var size = career.length;
    
    if(interval == size){
        return career;
    }
    
    var newCareer = [];
    var i = 0;
    for (var y = min; y < max + 1; y++) {
        if (career[i].year < y) {
            newCareer.push({
                constructorId: career[i].constructorId,
                points: 0,
                position: "NA",
                snd: 0,
                thd: 0,
                wins: 0,
                year: y,
                dummy: "DUMMY"
            });
        } else if (career[i].year > y) {
            newCareer.push({
                constructorId: career[i].constructorId,
                points: 0,
                position: "NA",
                snd: 0,
                thd: 0,
                wins: 0,
                year: y,
                dummy: "DUMMY"
            });
        } else {
            newCareer.push(career[i]);
            if (i < size - 1) {
                i++;
            }
        }
    }
    return newCareer;

}

function getSumMetric(constructor) {
    var sum = 0;
    for (var i = 0; i < constructor.ids.length; i++) {
        sum = sum + constructor.ids[i].metric;
    }
    return sum;

}

function getDrivers(year, constructorid, drivers) {
    var reqDrivers = {
        first: 0,
        second: 0,
        firstWins: 0,
        secondWins: 0
    };
    for (var d in drivers) {

        var boolean = false;
        var wins = 0;
        var career = drivers[d].career;
        for (var i = 0; i < career.length; i++) {

            if (career[i].year == year && career[i].constructorId == constructorid) {
                boolean = true;
                wins = career[i].wins;
            }
        }

        if (boolean == true) {
            if (reqDrivers["first"] != 0) {

                if (wins > reqDrivers.firstWins) {
                    reqDrivers["second"] = reqDrivers["first"];
                    reqDrivers["first"] = d;

                    reqDrivers["secondWins"] = reqDrivers["firstWins"];
                    reqDrivers["firstWins"] = wins;
                } else {
                    reqDrivers["second"] = d;
                    reqDrivers["secondWins"] = wins;
                }
            } else {
                reqDrivers["first"] = d;
                reqDrivers["firstWins"] = wins;
            }
        }
    }
    return reqDrivers;
}


function getDriversAdvanced(year, constructorid, drivers, metric) {
    var reqDrivers = [];
    for (var d in drivers) {

        var boolean = false;
        var wins = 0;
        var points = 0;
        var career = drivers[d].career;
        for (var i = 0; i < career.length; i++) {

            if (career[i].year == year && career[i].constructorId == constructorid) {
                boolean = true;
                wins = career[i].wins;
                points = career[i].points;
                // much more efficient. Even more efficient would be to use team composition
                break;
            }
        }

        if (boolean == true) {
            reqDrivers.push({
                "driver": d,
                "points": points,
                "wins": wins
            });
        }
    }

    function compare(a, b) {
        if (a.metric > b.metric)
            return -1;
        if (a.metric < b.metric)
            return 1;
        return 0;
    }

    reqDrivers.sort(compare);

    return reqDrivers;

}



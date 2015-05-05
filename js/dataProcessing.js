function makeIdsComplete(constructors) {
    var newConstructors = constructors;
    //get max number ids
    var max = 0;
    for (var i = 0; i < constructors.length; i++) {

        var tempYear = constructors[i];
        for (var j = 0; j < tempYear.length; j++) {
            var tempLength = tempYear[j].ids.length;
            if (tempLength > max) {
                max = tempLength;
            }
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

    return constructors2;
}

function fill_career_advanced(min, max, career) {
    var interval = max + 1 - min;
    var size = career.length;
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
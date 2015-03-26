var drivers;
var constructors;

function loadData() {
    $.getJSON('datasheets/drivers.json', function (data) {
        drivers = data;
    });

    $.getJSON('datasheets/constructsion.json', function (data) {
        constructor = data;
    })
}

/* Loading data from the CSV */
d3.csv("data/Schumacher/data.csv", function (error, data) {
    // http://stackoverflow.com/questions/9491885/csv-to-array-in-d3-js
    var teamNames = d3.keys(data[0]).filter(function (key) {
        return key !== "Year";
    });

    data.forEach(function (d) {
        d.teams = teamNames.map(function (name) {
            return {
                name: name,
                value: +d[name] + 0.1
            };
        });
        d.drivers = [];
        d.events = [];
    });

    x0.domain(data[0].teams.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d3.max(d.teams, function (d) {
            return d.value;
        });
    })]);

    /* Call function for organizing the data */
    useTeamData(data);
});



/* Organizing the data for each team and the searched driver. 
For now, we only focus on one driver, namely Michael Schumacher */
function useTeamData(teamdata) {
    d3.csv("data/Schumacher/data_ms.csv", function (error, data) {
        var attr = d3.keys(data[0]);
        // console.log(attr);

        // Collect the name of the F1-constructor 
        // and number of wins for each team
        data.forEach(function (d) {
            d = attr.map(function (name) {
                return {
                    name: name,
                    value: d[name]
                };
            });
        });

        // Collects the data for Michael Schumacher
        // That is the team name and number of wins for each year
        var dataSchumacher = {};
        data.forEach(function (d) {
            dataSchumacher[d.Year] = {
                name: "Schumacher",
                value: d.Wins,
                Team: d.Team
            };
        });

        // Checks whether Schumacher changed team
        // Used to add events to the timeline
        var combinedData = [];
        var currentTeam = "no team";
        teamdata.forEach(function (d) {
            var temp = d;
            if (d.Year in dataSchumacher) {
                if (dataSchumacher[d.Year].Team != currentTeam) {
                    temp.events.push(dataSchumacher[d.Year].name + " joins team " + dataSchumacher[d.Year].Team);
                    currentTeam = dataSchumacher[d.Year].Team;
                }
                temp.drivers.push(dataSchumacher[d.Year])
            }
            combinedData.push(temp);
        });

        // Call function for creating the bar charts
        // using the array holding the data of the different constructors
        // as well as the data for Michael Schumacher
        makeBarCharts(combinedData);
    });
}
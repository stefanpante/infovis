/* Margin, width and height values */
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

/* Scaling X-axis */
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);

/* Scaling Y-axis */
var y = d3.scale.linear()
    .range([height, 0]);

/* X-axis */
var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

/* Y-axis */
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

/* Coloring of the different F1-constuctors */
colors = d3.scale.category20();


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

loadData();
/* Loading data from the CSV */
d3.csv("prototype/Schumacher/data.csv", function (error, data) {
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
    d3.csv("prototype/Schumacher/data_ms.csv", function (error, data) {
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


function createTimeLineNav(data) {
    // select the timeline navigation.
    var time_line_nav = d3.select("#timelineNav");
    var selector = $("#selector");

    // get the total number of years to display
    var numberOfYears = data.length;
    // Calculate the totalwidth of the timeline
    var totalWidth = numberOfYears * 500;

    // calculate the width of each year in the navigation in percentages 
    var relativeWidth = 100 / numberOfYears;

    // Draggable timeline displaying the years
    var years = time_line_nav.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year')
        .text(function (d) {
            return d.Year;
        })
        .attr("style", "width:" + relativeWidth + "%");

    // calculate the width that the selector has so that it corresponds to the displayed years
    var width = $("#timelineNav").width();
    var selectorWidth = parseInt($("#timelineNav").outerWidth()) * parseInt($("#timeline").outerWidth()) / totalWidth;
    selector.css({
        width: selectorWidth + "px"
    })

    // make the navigation selector draggable
    $("#selector").draggable({
        axis: 'x',

        drag: function (event) {
            var position = $(event.target).position();
            var left = position.left;
            if (position.left < 0) {
                left = 0;
                $("#selector").css({
                    "left": left
                });
            }
            if (position.left + selectorWidth > width) {
                left = width - selectorWidth;
                $("#selector").css({
                    "left": left
                });
            }
            var factor = left / width;
            var offset = -factor * totalWidth;

            $("#wrap_timeline").css({
                "left": offset + "px"
            })
        }

    });


}


/* Creating the bar charts */
function makeBarCharts(data) {
    createTimeLineNav(data);

    // This code cannot be placed in a seperated function because of the async nature of js.
    //parent
    var time_line = d3.select("#wrap_timeline");

    //years
    years = time_line.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year');

    years.append("div").attr('class', 'head').text(function (d) {
        return d.Year
    });

    var totalWidth = data.length * 500;
    
    // create one global svg, so that the trend line can be drawn
    // other svg's for each year will be appended to this one instead of 
    // of being inserted into the year div
    var wrapperSVG = time_line.append('svg')
        .attr("width", totalWidth)
        .attr("id", "wrapperSVG");

    /* Initialise the specifications of the combined SVG */
    var svgs = years.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // draw all the elements of the barchart
    drawConstructors(svgs);
    drawDrivers(svgs);
    drawEvents(svgs);
    drawAxis(svgs);


}


function createTimeline(data){
    
}
/*
 * Draws the bars for the teams
 */
function drawConstructors(svgs) {
     svgs.selectAll("rect")
        .data(function (d) {
            return d.teams;
        })
        .enter().append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d) {
            return x0(d.name);
        })
        .attr("y", function (d) {
            if (isNaN(d.value)) {
                return height;
            }
            return y(d.value);
        })
        .attr("height", function (d) {
            if (isNaN(d.value)) {
                return 0;
            }
            return height - y(d.value);
        })
        .attr("class", "team")
        .style("fill", function (d, i) {
            return colors(i)
        });
}
/*
 * Draw the bars for the drivers on top of the teams bar.
 */
function drawDrivers(svgs){
     // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    svgs.append("g").selectAll("rect")
        .data(function (d) {
            return d.drivers;
        })
        .enter().append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d) {
            return x0(d.Team);
        })
        .attr("y", function (d) {
            if (isNaN(d.value)) {
                return height;
            }
            return y(d.value);
        })
        .attr("height", function (d) {
            if (isNaN(d.value)) {
                return 0;
            }
            return height - y(d.value);
        })
        .style("fill", 'white')
        .style("fill-opacity", .2)
        /* .style("fill", function (d) {
            // console.log(d);
            return colors[d.Team];
        })
        */
        .attr("class", "driver");
}
/*
 * Draw the events (change of team for now)
 */
function drawEvents(svgs) {

    
    // SVG for bar charts (events)
    // Drawing a vertical bar to indicate the driver changed team
    var event = svgs.append("g").selectAll("rect")
        .data(function (d) {
            return d.events;
        })
        .enter().append("rect")
        .attr("width", 10)
        .attr("x", -5)
        .attr("y", 0)
        .attr("height", 500)
        .attr("class", "event")
    
    // SVG for the events text
    // Displaying whether the driver changed team
    svgs.append("g").selectAll("text")
        .data(function (d) {
            return d.events;
        })
        .enter().append("text")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        })
        .attr("fill", "red")
        .attr("x", 250)
        .attr("y", 10);
}

/*
 * Draws the number of wins axis on each year.
 */
function drawAxis(svgs) {
    svgs.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("fill", 'white')
        .style("text-anchor", "end")
        .text("Wins");

}
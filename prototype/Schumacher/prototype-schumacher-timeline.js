var width = 500;
var height = $("#timeline").height();
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
    //console.log(JSON.stringify(data));
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
        containment: "parent",
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
            });

            $("#wrapperSVG").css({
                "left": offset + "px"
            });
        }

    });

    $("#timelineNav .year").click(function (event) {
        var left = $(event.target).position().left;

        var factor = left / width;
        var offset = -factor * totalWidth;

        $("#selector").css({
            left: left + "px"
        });

        $("#wrap_timeline").css({
            "left": offset + "px"
        });

        $("#wrapperSVG").css({
            "left": offset + "px"
        });
    });

    $("#wrap_timeline").draggable({
        axis: 'x',

        drag: function (event) {
            var left = parseInt($(event.target).position().left);

            $("#wrapperSVG").css({
                left: left + "px"
            });
            var factor = -left / totalWidth;
            console.log("factor: " + factor);
            var left1 = width * factor;

            $("#selector").css({
                left: left1
            })
        },

        end: function (event) {
            var left = parseInt($(event.target).position().left);

            $("#wrapperSVG").css({
                left: left + "px"
            });
            var factor = -left / totalWidth;
            console.log("factor: " + factor);
            var left1 = width * factor;
            console.log(left1);
            $("#selector").css({
                left: left1
            })
        }
    });


}


/* Creating the bar charts */
function makeBarCharts(data) {

        console.log(data);
        // This code cannot be placed in a seperated function because of the async nature of js.
        //parent
        var time_line = d3.select("#wrap_timeline");

        //years
        years = time_line.selectAll(".year")
            .data(data).enter()
            .append("div")
            .attr('class', 'year')
            .attr("style", "height:" + height);

        years.append("div")
            .attr('class', 'head')
            .text(function (d) {
                return d.Year
            });

        var totalWidth = data.length * width;

        // create one global svg, so that the trend line can be drawn
        // other svg's for each year will be appended to this one instead of 
        // of being inserted into the year div
        var wrapperSVG = d3.select('#timeline').append('svg')
            .attr("width", totalWidth)
            .attr("height", height)
            .attr("id", "wrapperSVG");


        /* Initialise the specifications of the combined SVG */
        var svgs = wrapperSVG.selectAll("svg").data(data).enter().append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("x", function (d, i) {
                var left = width * i;
                return left;
            });

        //draw all the elements of the barchart

        createTimeLineNav(data);
        drawConstructors(svgs);
        drawDrivers(svgs);
        drawTrendLine(wrapperSVG, data);
        divideInBlocks(svgs);
        drawEvents(svgs);
//        drawAxis(svgs);



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
            .attr("class", function(d,i){
                return "team team-" + i;
        })
            .style("fill", function (d, i) {
                return colors(i)
            });
    }
    /*
     * Draw the bars for the drivers on top of the teams bar.
     */
function drawDrivers(svgs) {
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


function drawTrendLine(svg, data) {

        // function to calculate the x position
        var calculateX = function (d, i) {
            if (!d.drivers[0]) {
                return i * width;
            } else {
                return i * width + x0(d.drivers[0].Team) + x0.rangeBand() / 2;
            }
        }

        // function to calculate the y position
        var calculateY = function (d) {
            if (!d.drivers[0]) {
                return y(0)
            } else {
                var val = parseInt(d.drivers[0].value);
                if (isNaN(val)) {
                    return 0;
                }
                return y(val);
            }
        }

        // add little circles to where the driver is located
        svg.selectAll(".circle").data(data).enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cy", calculateY)
            .attr("cx", calculateX)
            .attr("r", 3);

        // function to draw the line
        var lineFunction = d3.svg.line()
            .x(calculateX)
            .y(calculateY).interpolate("monotone");

        // draw the line
        svg.append("path")
            .attr("class", "trendline")
            .attr("d", lineFunction(data));
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
        .attr("width", 2)
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("class", "event");

    // SVG for the events text
    // Displaying whether the driver changed team
    svgs.append("g").selectAll("text")
        .data(function (d) {
            return d.events;
        })
        .enter().append("text")
        //.style("text-anchor", "end")
        .text(function (d) {
            return d;
        })
        .attr("class", "eventText")
        .attr("x", 45)
        .attr("y", 35);
}

/*
 * Draws the number of wins axis on each year.
 */
function drawAxis(svgs) {
    svgs.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(10,0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -23)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("Wins")
        .attr("class", "axisText");

}

/*
 * Draws the number of wins axis on each year.
 */
function divideInBlocks(svgs) {
    var domainY = y.domain();
    var maxY = domainY[1]-1;
    var linesDividers = [];
    var linesAxisLeft = [];
    var linesAxisRight = [];
    var axisL = 10;
    for (i = 1; i < maxY; i++) {
        var lineData = [ { "x": 0,   "y": y(i+0.1)},  { "x": width,  "y": y(i+0.1)}];
        linesDividers.push(lineData);

        var lineData2 = [ { "x": 0,   "y": y(i+0.1)},  { "x": axisL,  "y": y(i+0.1)}];
        linesAxisLeft.push(lineData2);

        var lineData3 = [ { "x": width-axisL,   "y": y(i+0.1)},  { "x": width,  "y": y(i+0.1)}];
        linesAxisRight.push(lineData3);
    }




    //This is the accessor function we talked about above
    var lineFunction = d3.svg.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .interpolate("linear");



    //The line SVG Path we draw
    for (i = 0; i < linesDividers.length; i++) {
        var lineGraph = svgs.append("path")
            .attr("d", lineFunction(linesDividers[i]))
            .attr("stroke", "#0b0b0b")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        var lineGraph2 = svgs.append("path")
            .attr("d", lineFunction(linesAxisLeft[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", "none");

        var lineGraph3 = svgs.append("path")
            .attr("d", lineFunction(linesAxisRight[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", "none");

            svgs.append("text")
            .attr("y", y(i+1.3))
            .attr("x", 10)
            .text(i+1)
            .attr("class", "axisText");
    }




}
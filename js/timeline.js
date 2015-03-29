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

/* Y-axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"))
    .innerTickSize(-width)
    .outerTickSize(0)
    .tickpadding(-10);
*/
/* Coloring of the different F1-constuctors */
colors = d3.scale.category20();

var svgs_years;

function temporarySearchConstructor(constructors,id){
    for (var i = 0; i < constructors.length; i++) {
       if(constructors[i].constructorId == id){
           return constructors[i].name;
       }


    }
    return "none";
}

function updateXAxis(constructors_data) {
        var constructors = [];
        for (var i = 0; i < constructors_data.length; i++) {
            var year = constructors_data[i];
            for (var j = 0; j < year.length; j++) {
                var constructorId = year[j].constructorId;

                if (constructors.indexOf(constructorId) < 0) {
                    constructors.push(constructorId);
                }

            }

        }
        console.log(constructors);
        x0.domain(constructors);
    }
    /* Creating the bar charts */
function makeBarCharts(data, driver) {
    // This code cannot be placed in a seperated function because of the async nature of js.
    //parent
    var time_line = d3.select("#wrap_timeline");
    var selected_driver = data.drivers[driver].career;
    console.log("CAREER " );
    console.log(selected_driver);
    var selected_constructors = [];
    // get the constructors for the years that the driver was active
    for (var i = 0; i < selected_driver.length; i++) {
        var year = data.constructors[selected_driver[i].year];
        selected_constructors.push(year);
    }

    updateXAxis(selected_constructors);
    //years
    years = time_line.selectAll(".year")
        .data(selected_driver).enter()
        .append("div")
        .attr('class', 'year')
        .attr("style", "height:" + height);

    years.append("div")
        .attr('class', 'head')
        .text(function (d) {
            return d.year;
        });

    var totalWidth = d3.entries(selected_driver).length * width;

    // create one global svg, so that the trend line can be drawn
    // other svg's for each year will be appended to this one instead of 
    // of being inserted into the year div
    var wrapperSVG = d3.select('#timeline').append('svg')
        .attr("width", totalWidth)
        .attr("height", height)
        .attr("id", "wrapperSVG");


    /* Initialise the specifications of the combined SVG */
    svgs_years = wrapperSVG.selectAll("svg").data(selected_driver).enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("x", function (d, i) {
            var left = width * i;
            return left;
        });

    //        //draw all the elements of the barchart

    createTimeLineNav(selected_driver);
    drawConstructors(wrapperSVG, selected_constructors);
    drawDriver(wrapperSVG, selected_driver);
    drawTrendLine(wrapperSVG, selected_driver);
    divideInBlocks(wrapperSVG);
    console.log(data.constructors)
    drawEvents(wrapperSVG, selected_driver, data.constructors);
    //drawAxis(svgs);
    //    
    //        stopLoadingAnimation();





}



function stopLoadingAnimation() {
        $("#loader").fadeOut(1500, function (event) {
            $(event.target).remove();
        })
    }
    /*
     * Draws the bars for the teams
     */
function drawConstructors(svgs, selected_constructors) {
        var gs = svgs.selectAll("years")
            .data(selected_constructors)
            .enter()
            .append("svg")
            .attr("x", function (d, i) {
                return i * width;
            }).attr("width", width);

        gs.selectAll("rect").data(function (d) {
                return d;
            }).enter()
            .append("rect")
            .attr("width", x0.rangeBand())
            .attr("x", function (d, i) {
                return x0(d.constructorId);
            })
            .attr("y", function (d) {
                return y(d.wins) - 2;
            })
            .attr("height", function (d) {
                return 2 + height - y(d.wins);
            })
            .attr("class", function (d, i) {
                return "team team-" + i;
            })
            .attr("fill", "white")
            //            .style("fill", function (d, i) {
            //                return colors(i)
            //            });
    }
    /*
     * Draw the bars for the drivers on top of the teams bar.
     */
function drawDriver(svgs, selected_data) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    svgs.selectAll("rect2")
        .data(selected_data)
        .enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            console.log(d);
            console.log(d.constructorId);
            return width * i + x0(d.constructorId);
        })
        .attr("y", function (d) {
            var wins = parseInt(d.wins);
            return y(wins);
        })
        .attr("height", function (d) {
            return height - y(d.wins);
        })
        .style("fill", 'red')
        .style("fill-opacity", .5)
        /* .style("fill", function (d) {
            // console.log(d);
            return colors[d.Team];
        })
        */
        //.attr("class", "driver");


}


function drawTrendLine(svg, data) {
    // function to calculate the x position
    var calculateX = function (d, i) {
        return i * width + x0(d.constructorId) +x0.rangeBand()/2;

    }

    // function to calculate the y position
    var calculateY = function (d) {
        var wins = parseInt(d.wins);
        return y(wins);

    }

    // add little circles to where the driver is located
    svg.selectAll(".circle").data(data).enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cy", calculateY)
        .attr("cx", calculateX)
        .attr("id", function (d) {
            d.key
        })
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
function drawEvents(svgs,driver, constructors) {



    var events = [];
    var current_team = "none";
    for (var i = 0; i < driver.length; i++) {
        var team = driver[i].constructorId;
        if (team != current_team) {
            var c = constructors[driver[i].year];
            console.log(c);
            events.push(["Joins "+ temporarySearchConstructor(c,team) ]);
            current_team = team;
        }else{
            events.push([]);
        }

    }


    var svgs2=svgs.selectAll("svg")
        .append("svg")
        .attr("width", width);


    svgs.selectAll("rect2")
        .data(events)
        .enter()
        .append("rect")
        .attr("width",width)
        .attr("x", function (d, i) {

            return width * i;
        })
        .attr("y", 0)
        .attr("height", function (d) {
            return d.length * 10;
        })
        .style("fill", 'red')
        .style("fill-opacity", .5);

    svgs.append("g").selectAll("text")
        .data(events)
        .enter().append("text")
        //.style("text-anchor", "end")
        .text(function (d) {
            if(d == []){
                return ""
            }
            return d[0];
        })
        .attr("class", "eventText")
        .attr("x", function (d, i) {

            return width * i + width/3;
        })
        .attr("y", 35);
    /* .style("fill", function (d) {
     // console.log(d);
     return colors[d.Team];
     })
     */
    //.attr("class", "driver");

    /*
    // SVG for bar charts (events)
    // Drawing a vertical bar to indicate the driver changed team
    var event = svgs2.append("g").selectAll("rect")
        .data(events)
        .enter().append("rect")
        .attr("width", 10)
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
        */
}

/*
 * Draws the number of wins axis on each year.
 */
function drawAxis(svgs) {
    svgs.append("g")
        .attr("class", "y axis")
        .call(yAxis)

}

/*
 * Draws the number of wins axis on each year.
 */
function divideInBlocks(svgs) {
    var svgs2=svgs.selectAll("svg")
        .append("svg")
        .attr("width", width);

    var domainY = y.domain();
    var maxY = domainY[1] - 1;
    var linesDividers = [];
    var linesAxisLeft = [];
    var linesAxisRight = [];
    var axisL = 10;
    for (i = 1; i < maxY; i++) {
        var lineData = [{
            "x": 0,
            "y": y(i + 0.1)
        }, {
            "x": width,
            "y": y(i + 0.1)
        }];
        linesDividers.push(lineData);

        var lineData2 = [{
            "x": 0,
            "y": y(i + 0.1)
        }, {
            "x": axisL,
            "y": y(i + 0.1)
        }];
        linesAxisLeft.push(lineData2);

        var lineData3 = [{
            "x": width - axisL,
            "y": y(i + 0.1)
        }, {
            "x": width,
            "y": y(i + 0.1)
        }];
        linesAxisRight.push(lineData3);
    }




    //This is the accessor function we talked about above
    var lineFunction = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate("linear");



    //The line SVG Path we draw
    for (i = 0; i < linesDividers.length; i++) {
        var lineGraph = svgs2.append("path")
            .attr("d", lineFunction(linesDividers[i]))
            .attr("stroke", "#0b0b0b")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");

        var lineGraph2 = svgs2.append("path")
            .attr("d", lineFunction(linesAxisLeft[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");

        var lineGraph3 = svgs2.append("path")
            .attr("d", lineFunction(linesAxisRight[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");

        svgs2.append("text")
            .attr("y", y(i + 1.3))
            .attr("x", 10)
            .text(i + 1)
            .attr("class", "axisText");
    }




}
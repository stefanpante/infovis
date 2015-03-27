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

/* Creating the bar charts */
function makeBarCharts(data) {
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
        console.log("data");
        console.log(data);
        createTimeLineNav(data);
        drawConstructors(svgs);
        drawDrivers(svgs);
        drawTrendLine(wrapperSVG, data);
        divideInBlocks(svgs);
        drawEvents(svgs);
//        drawAxis(svgs);
    
        stopLoadingAnimation();
    
    



    }


function stopLoadingAnimation(){
    $("#loader").fadeOut(1500, function(event){
        $(event.target).remove();
    })
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
            .attr("stroke-width", 0.5)
            .attr("fill", "none");

        var lineGraph2 = svgs.append("path")
            .attr("d", lineFunction(linesAxisLeft[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");

        var lineGraph3 = svgs.append("path")
            .attr("d", lineFunction(linesAxisRight[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");

            svgs.append("text")
            .attr("y", y(i+1.3))
            .attr("x", 10)
            .text(i+1)
            .attr("class", "axisText");
    }




}
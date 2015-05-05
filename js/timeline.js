var metric = "wins"; //"points" or "wins!"
var width = 500;

var height = $("#timeline").height();
var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1); // x-axis
var y = d3.scale.linear().range([height, 0]); //y

/* Coloring of the different F1-constuctors */
colors = d3.scale.category20();

var navWidth = 300; //temp
var navHeight = 30; //temp

/* Scaling X-axis */
var x0Nav = d3.scale.ordinal().rangeRoundBands([0, navWidth], 0.1);

/* Scaling Y-axis */
var yNav = d3.scale.linear().range([navHeight, 0]);

function changeDriver(data, driver) {

    var name = data.drivers[driver].name;
    var name2 = data.drivers[window.driver1].name;
    var name3 = data.drivers[window.driver2].name;
    var html = new EJS({
        url: 'tpl/chooser.ejs'
    }).render({
        driver3: {
            driverId: driver,
            name: name
        },

        driver2: {
            driverId: driver1,
            name: name2
        },

        driver1: {
            driverId: driver2,
            name: name3
        }
    });

    $("#misc").hide().append(html);
    $("#misc").fadeIn(200);
    $("#cancel").on('click', function (event) {
        $("#chooser").fadeOut(500, function () {
            $("#chooser").remove();
        })
    })

    $("#change").on('click', function (event) {
        var driverId = $('input[type="radio"]:not(:checked)').val();
        if (driverId == window.driver1) {
            window.driver2 = driver;
        } else {
            window.driver1 = driver;
        }


        var n1 = data.drivers[window.driver1].name;
        var n2 = data.drivers[window.driver2].name;

        $("#title .name.two").text(n2);
        $("#title .name.one").text(n1);
        $("#wrap_timeline").empty();
        $("#wrapperSVG").remove();
        $("#timelineNav .year").remove();
        $(".d3-tip").hide();

        $("#wrap-stats").empty();
        makeBarCharts(data, window.driver1, window.driver2);

        $("#chooser").fadeOut(500, function () {
            $("#chooser").remove();
        })
    });

}

function updateXAxis(constructors_data, width) {
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
    //console.log(constructors);
    x0.domain(constructors);
    x0.rangeRoundBands([0, width], 0.1);
}

/* Creating the bar charts */
function makeBarCharts(data, driver1, driver2) {

    $("#wrap_timeline").empty();
    $("#wrapperSVG").remove();
    $("#timelineNav .year").remove();
    $(".d3-tip").hide();

    $("#wrap-stats").empty();

    window.driver1 = driver1;
    window.driver2 = driver2;

    // This code cannot be placed in a seperated function because of the async nature of js.
    //parent
    var time_line = d3.select("#wrap_timeline");
    var selected_driver_1 = data.drivers[driver1].career;
    var selected_driver_2 = data.drivers[driver2].career;
    var selected_constructors = [];

    function compare(a, b) {
        if (a.year < b.year)
            return -1;
        if (a.year > b.year)
            return 1;
        return 0;
    }

    selected_driver_1.sort(compare);
    selected_driver_2.sort(compare);


    var minYear_1 = selected_driver_1[0].year;
    var minYear_2 = selected_driver_2[0].year;

    var maxYear_1 = selected_driver_1[selected_driver_1.length - 1].year;
    var maxYear_2 = selected_driver_2[selected_driver_2.length - 1].year;

    var minY = Math.min(minYear_1, minYear_2); //absolute min
    var maxY = Math.max(maxYear_1, maxYear_2); //absoluut max


    var dummy = [];
    // get the constructors for the years that the driver was active
    for (var yearI = minY; yearI < maxY + 1; yearI++) {
        if (yearI in data.constructors) {
            dummy.push(yearI);
            var constructors = data.constructors[yearI];
            var year2 = newConstructorDataTypesAdvanced(yearI, constructors, data.drivers, metric);

            selected_constructors.push(year2);
        }

    }

    selected_constructors = makeIdsComplete(selected_constructors);

    var scale = 0;
    for (var i = 0; i < selected_constructors.length; i++) {
        constructors = selected_constructors[i];
        for (var j = 0; j < constructors.length; j++) {
            var s = parseInt(constructors[j][metric]);
            if (s >= scale) {
                scale = s;
            }
        }
    }


    y.domain([0, scale * 1.2]);



    selected_driver_1 = fill_career_advanced(minY, maxY, selected_driver_1);
    selected_driver_2 = fill_career_advanced(minY, maxY, selected_driver_2);

    //years
    years = time_line.selectAll(".year")
        .data(dummy).enter()
        .append("div")
        .attr('class', 'year')
        .attr("style", "height:" + height);

    years.append("div")
        .attr('class', 'head')
        .text(function (d) {
            return d;
        });

    width = parseInt($("#timeline .year").width());

    var totalWidth = d3.entries(dummy).length * width;
    updateXAxis(selected_constructors, width);

    // create one global svg, so that the trend line can be drawn
    // other svg's for each year will be appended to this one instead of 
    // of being inserted into the year div
    var wrapperSVG = d3.select('#timeline').append('svg')
        .attr("width", totalWidth)
        .attr("height", height)
        .attr("id", "wrapperSVG");

    createTooltips(data, wrapperSVG);
    divideInBlocks(wrapperSVG);
    // draw all the elements of the barchart
    createTimeLineNav2(selected_driver_1, selected_driver_2, selected_constructors, data, driver1, driver2);
    drawTrendLine(wrapperSVG, selected_driver_1, 1);
    drawTrendLine(wrapperSVG, selected_driver_2, 2);
    drawConstructors(wrapperSVG, selected_constructors, data, driver1, driver2);
    drawDriver(wrapperSVG, selected_driver_1, 1);
    drawDriver(wrapperSVG, selected_driver_2, 2);
    drawStatistics(selected_driver_1, selected_driver_2, width);

}


function drawStatistics(selected_driver_1, selected_driver_2, width) {
    for (var i = 0; i < selected_driver_1.length; i++) {
        var html = new EJS({
            url: 'tpl/stats2.ejs'
        }).render({
            driver1: selected_driver_1[i],
            driver2: selected_driver_2[i],
            width: width
        });
        $("#wrap-stats").append(html);
    }
}

// Draw the bars for the constructors
function drawConstructors(svgs, selected_constructors, data, selectedDriverID1, selectedDriverID2) {

    var gs = svgs.selectAll("years")
        .data(selected_constructors)
        .enter()
        .append("svg")
        .attr("x", function (d, i) {
            return i * width;
        }).attr("width", width);

    gs.selectAll("rectTotal").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            return y(parseInt(d.sumMetric) + 0.3);
        })
        .attr("height", function (d) {

            return height - y(d.sumMetric + 0.3);
        })
        .attr("class", function (d, i) {
            return "teamTotal";
        })
        .on('mouseover', tipTotal.show)
        .on('mouseout', tipTotal.hide);



    gs.selectAll("rectFirst").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            return y(parseInt(d.sumMetric) + 0.3);
        })
        .attr("height", function (d) {
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return 0;
            }
            return height - y(d.ids[1].metric);
        })
        .attr("class", "team")
        .on("click", function (d) {
            changeDriver(data, d.ids[1].driver);
        })
        .on('mouseover', tip2.show)
        .on('mouseout', tip2.hide);

    gs.selectAll("rectSecond").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return y(parseInt(d.sumMetric) + 0.3);
            }
            return y(parseInt(d.ids[0].metric) + 0.3);
        })
        .attr("height", function (d) {
            if (d.ids[0].driver == selectedDriverID1 || d.ids[0].driver == selectedDriverID2) {
                return 0;
            }
            if (d.ids.second == selectedDriverID1 || d.ids.second == selectedDriverID2) {
                return height - y(d.ids[0].metric);
            }

            return height - y(d.ids[0].metric + 0.3);
        })
        .attr("class", function (d, i) {
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return "team";
            }
            return "team2";
        })
        .on("click", function (d) {
            changeDriver(data, d.ids[0].driver);
        })
        .on('mouseover', tip1.show)
        .on('mouseout', tip1.hide);

}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriver(svgs, selected_data, nr) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var bars = svgs.selectAll("rect" + nr)
        .data(selected_data);

    var className;
    if (nr == 1) {
        className = "one";
    } else {
        className = "two";
    }

    bars.attr('fill', 'red');

    bars.enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            if ("dummy" in d) {
                return i * width + width / 2;
            }
            return width * i + x0(d.constructorId);
        })
        .attr("y", function (d) {
            var wins = parseInt(d[metric]);
            return y(wins + 0.3);
        })
        .attr("height", function (d) {
            if (d == "nothing") {
                return height - y(0);
            }
            return height - y(d[metric] + 0.3);
        })
        .attr("class", className)
        .style("position", 'absolute')
        .style("z-index", function (d) {
            return height - parseInt(d[metric])
        })
        .on('mouseover', tipSelectedDriver.show)
        .on('mouseout', tipSelectedDriver.hide);


}


function drawTrendLine(svg, data, nr) {
    // function to calculate the x position

    var className;
    if (nr == 1) {
        className = "one";
    } else {
        className = "two";
    }

    var calculateX = function (d, i) {
        if ("dummy" in d) {
            return i * width + width / 2;
        }
        return i * width + x0(d.constructorId) + x0.rangeBand() / 2;

    }

    // function to calculate the y position
    var calculateY = function (d) {
        if (d == "nothing") {
            return y(0.3);
        }
        var wins = parseInt(d[metric]);
        return y(wins + 0.3);

    }

    // add little circles to where the driver is located
    svg.selectAll(".circle" + nr).data(data).enter()
        .append("circle")
        .attr("class", "circle" + nr)
        .attr("cy", calculateY)
        .attr("cx", calculateX)
        .attr("id", function (d) {
            if (d == "nothing") {
                "nothing";
            } else {
                d.key
            }

        })
        .attr("r", 3);

    var lineFunc1 = d3.svg.line()
        .x(calculateX)
        .y(function (d, i) {
            return y(0.3)
        })
        .interpolate("monotone");
    // function to draw the line
    var lineFunction = d3.svg.line()
        .x(calculateX)
        .y(calculateY).interpolate("monotone");

    // draw the line
    svg.append("path")
        .attr("class", "trendline" + nr)
        .attr("d", lineFunc1(data))
        .transition()
        .duration(300)
        .attr("d", lineFunction(data));
}

/*
 * Draws the number of wins axis on each year.
 */
function divideInBlocks(svgs) {
    var svgs2 = svgs.selectAll("svg")
        .append("svg")
        .attr("width", width);
    var domainY = y.domain();
    var maxY = domainY[1] - 2;
    var linesDividers = [];
    var linesAxis = [];
    var axisLength = 4;

    for (i = 1; i < maxY; i++) {
        var lineData = [{
            "x": 0,
            "y": y(i - 0.7)
        }, {
            "x": width,
            "y": y(i - 0.7)
        }];
        linesDividers.push(lineData);

        var lineData2 = [{
            "x": 0,
            "y": y(i - 0.7)
        }, {
            "x": axisLength,
            "y": y(i - 0.7)
        }];
        linesAxis.push(lineData2);
    }

    var lineFunction = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate("linear");


    for (i = 0; i < linesDividers.length; i++) {
        var lineGraphDividers = svgs2.append("path")
            .attr("d", lineFunction(linesDividers[i]))
            .attr("stroke", "#0b0b0b")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");
        var lineGraph = svgs2.append("path")
            .attr("d", lineFunction(linesAxis[i]))
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");
    }

    //    for (i = 1; i < linesDividers.length; i++) {
    //        svgs2.append("text")
    //            .attr("y", y(i))
    //            .attr("x", 10)
    //            .text(i)
    //            .attr("class", "axisText");
    //    }

    svgs2.append("text")
        .attr("y", y(8))
        .attr("x", 10)
        .text(8)
        .attr("class", "axisText");

    svgs2.append("text")
        .attr("y", y(16))
        .attr("x", 10)
        .text(16)
        .attr("class", "axisText");
}

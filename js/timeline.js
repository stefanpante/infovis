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

function updateYScale() {
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
}

/* Creating the bar charts */
function makeBarCharts(data, driver1, driver2) {

    hideAndRemoveBars();
    window.driver1 = driver1;
    window.driver2 = driver2;

    // This code cannot be placed in a seperated function because of the async nature of js.
    //parent
    var time_line = d3.select("#wrap_timeline");

    selected_driver_1 = data.drivers[driver1].career;
    selected_driver_2 = data.drivers[driver2].career;
    selected_constructors = [];

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

    updateYScale();


    selected_constructors = makeIdsComplete(selected_constructors);

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

    window.wrapperSVG = wrapperSVG;

    createTooltips(data, wrapperSVG);

    // draw all the elements of the barchart
    createTimeLineNav2(selected_driver_1, selected_driver_2, selected_constructors, data, driver1, driver2);

    drawTrendLine(wrapperSVG, selected_driver_1, 1);
    drawTrendLine(wrapperSVG, selected_driver_2, 2);
    showTrendLine(1);
    showTrendLine(2);

    drawConstructors(wrapperSVG, selected_constructors, data, driver1, driver2);
    drawDriver(wrapperSVG, selected_driver_1, 1);
    drawDriver(wrapperSVG, selected_driver_2, 2);

    // animation
    showBars();
    showBarsNav();
    if (metric == "wins") {
        divideInBlocks(wrapperSVG);
    } else {
        divideInBlocks2(wrapperSVG);
    }

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

        $(".stat").animate({
            opacity: 1,
            transform: "scale(1)"
        })
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

    var total = gs.selectAll("rectTotal").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("class", "teamTotal")
        .on('mouseover', tipTotal.show)
        .on('mouseout', tipTotal.hide);

    var firstDriver = gs.selectAll("rectFirst").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("class", "team")
        .on("click", function (d) {
            changeDriver(data, d.ids[1].driver);
        })
        .on('mouseover', tip2.show)
        .on('mouseout', tip2.hide);

    var secondDriver = gs.selectAll("rectSecond").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("class", "team2")
        .on("click", function (d) {
            changeDriver(data, d.ids[0].driver);
        })
        .on('mouseover', tip1.show)
        .on('mouseout', tip1.hide);

    var bard = [total, firstDriver, secondDriver];

    for (var i = 0; i < bard.length; i++) {
        bard[i]
            .attr("width", x0.rangeBand())
            .attr("height", function (d) {
                return height - y(0.3);
            })
            .attr("x", function (d, i) {
                return x0(d.constructorId);
            })
            .attr("y", function (d) {
                return y(0.3);
            })
    }

    // make globally accessible for animation
    bars.total = total;
    bars.firstDriver = firstDriver;
    bars.secondDriver = secondDriver;

}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriver(svgs, selected_data, nr) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var barss = svgs.selectAll("rect" + nr)
        .data(selected_data);

    var className;
    if (nr == 1) {
        className = "one";
    } else {
        className = "two";
    }
    // save the object for global usage
    bars[className] = barss;

    barss.enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            if ("dummy" in d) {
                return i * width + width / 2;
            }
            return width * i + x0(d.constructorId);
        })
        .attr("y", y(0.3))
        .attr("height", height - y(0.3))
        .attr("class", className)
        .style("position", 'absolute')
        .on('mouseover', tipSelectedDriver.show)
        .on('mouseout', tipSelectedDriver.hide);
}

function drawTrendLine(svg, data, nr) {
    // function to calculate the x position
    var calculateX = function (d, i) {
        if ("dummy" in d) {
            return i * width + width / 2;
        }
        return i * width + x0(d.constructorId) + x0.rangeBand() / 2;

    }


    var lineFunc1 = d3.svg.line()
        .x(calculateX)
        .y(function (d, i) {
            return y(0.3)
        })
        .interpolate("monotone")



    // draw the line
    bars["line" + nr] = svg.append("path");
    bars["line" + nr].attr("class", "trendline" + nr)
        .data(data)
        .attr("d", lineFunc1(data))
        .attr("stroke-width", 1.25);

    bars["linedata" + nr] = data;


}

function showTrendLine(nr) {

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

    var lineFunction = d3.svg.line()
        .x(calculateX)
        .y(calculateY).interpolate("monotone");

    bars["line" + nr]
        .transition()
        .duration(300)
        .attr("d", lineFunction(bars["linedata" + nr]));

}



function showBars() {
    //second is de beste
    bars.firstDriver
        .transition()
        .duration(300)
        .attr("width", x0.rangeBand())
        .attr("height", function (d) {
            // niet weergeven als beide gekozen zijn
            if ((d.ids[1].driver == window.driver1 || d.ids[1].driver == window.driver2) && (d.ids[0].driver == window.driver1 || d.ids[0].driver == window.driver2)) {
                return 0;
            }
            return (height - y(parseInt(d.ids[1][metric]) + 0.3));
        })
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })

    .attr("y", function (d) {
        //verplaats naar onder als de 2de beste (first driver) gekozen is
        if (d.ids[1].driver == window.driver1 || d.ids[1].driver == window.driver2) {
            return y(parseInt(d.ids[1][metric]) + 0.3)
        }
        //return y(  worst +  best + 0.3)
        return y(parseInt(d.ids[1][metric]) + parseInt(d.ids[0][metric]) + 0.3);
        // ipv return y(parseInt(d[metric])+0.3);
    })

    // 
    bars.secondDriver
        .transition()
        .duration(300)
        .attr("width", x0.rangeBand())
        .attr("height", function (d) {
            // niet weergeven als beide gekozen zijn
            if ((d.ids[1].driver == window.driver1 || d.ids[1].driver == window.driver2) && (d.ids[0].driver == window.driver1 || d.ids[0].driver == window.driver2)) {
                return 0;
            }
            return (height - y(parseInt(d.ids[0][metric]) + 0.3));
        })
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            //verplaats naar boven als de 2de beste (first driver) gekozen is
            if (d.ids[1].driver == window.driver1 || d.ids[1].driver == window.driver2) {
                //return y(  worst +  best + 0.3)
                return y(parseInt(d.ids[1][metric]) + parseInt(d.ids[0][metric]) + 0.3);
                // ipv return y(parseInt(d[metric])+0.3);
            }
            return y(parseInt(d.ids[0][metric]) + 0.3);
        });

    bars.total
        .transition()
        .duration(300)
        .attr("width", x0.rangeBand())
        .attr("height", function (d) {

            return (height - y(parseInt(d[metric]) + 0.3));
        })
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {

            return y(parseInt(d[metric]) + 0.3);
        })

    bars.one
        .transition()
        .duration(300)
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
            return height - y(parseInt(d[metric]) + 0.3);
        })

    bars.two
        .transition()
        .duration(300)
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
            return height - y(parseInt(d[metric]) + 0.3);
        })

    $("rect.one").mouseover(function () {
        $("rect.one").css({
            "fill-opacity": 1,
            "stroke": "#043e83",
            "stroke-width": 2
        })
    })

    $("rect.two").mouseover(function () {
        $("rect.two").css({
            "fill-opacity": 1,
            "stroke": "#5a0026",
            "stroke-width": 2
        })
    })
    
    $("rect.one").mouseout(function () {
        $("rect.one").css({
            "fill-opacity": 0.7,
            "stroke-width": 0
            
        })
    })

    $("rect.two").mouseout(function () {
        $("rect.two").css({
            "fill-opacity": 0.7,
            "stroke-width": 0
        })
    })
}

function hideAndRemoveBars() {
    $("#wrap_timeline").empty();
    $("#wrapperSVG").remove();
    $("#timelineNav .year").remove();
    $(".d3-tip").hide();
    $("#wrap-stats").empty();
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

    window.svgs2 = svgs2;
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
            .attr("stroke-width", 1)
            .attr("fill", "none");
    }

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


function divideInBlocks2(svgs) {
    var svgs2 = svgs.selectAll("svg")
        .append("svg")
        .attr("width", width);
    var domainY = y.domain();
    var maxY = domainY[1] - 100;
    var linesDividers = [];
    var linesAxis = [];
    var axisLength = 4;

    window.svgs2 = svgs2;
    for (i = 1; i < maxY; i += 25) {
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
            .attr("stroke-width", 1)
            .attr("fill", "none");
    }

    svgs2.append("text")
        .attr("y", y(250))
        .attr("x", 10)
        .text(250)
        .attr("class", "axisText");

    svgs2.append("text")
        .attr("y", y(500))
        .attr("x", 10)
        .text(500)
        .attr("class", "axisText");
}
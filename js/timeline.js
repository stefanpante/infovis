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



/* Coloring of the different F1-constuctors */
colors = d3.scale.category20();

var namesDrivers = {};

var tip1;
var tip2;
var tipSelectedDriver;
var tipTotal;




var navWidth = 300; //temp

var navHeight = 30; //temp

/* Scaling X-axis */
var x0Nav = d3.scale.ordinal().rangeRoundBands([0, navWidth], 0.1);

/* Scaling Y-axis */
var yNav = d3.scale.linear().range([navHeight, 0]);

var xScale;
var yScale;

var oldestDriver = "alonso";

function changeDriver(data, driver) {

    var name = data.drivers[driver].name;

    $("#title .name").text(name);
    $("#wrap_timeline").empty();
    $("#wrapperSVG").remove();
    $("#timelineNav .year").remove();
    $(".d3-tip").hide();
    
    $("#wrap-stats").empty();
    makeBarCharts(data, oldestDriver,driver);
    oldestDriver = driver;

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
function makeBarCharts(data, driver1,driver2) {

    tip1 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            return '<div class="tooltip"><div class="name">' + data.drivers[d.ids.first].name +'</div><div class="wins"> ' + d.ids.firstWins + ' wins </div></div>'
        });

    tip2 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            return '<div class="tooltip"><div class="name">' + data.drivers[d.ids.second].name  +'</div><div class="wins"> ' + d.ids.secondWins  + ' wins </div></div>'
        });

    tipSelectedDriver = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            var myUpper = function (match) {
                return match.replace(/[\s_]+/, ' ').toUpperCase();
            }
            return '<div class="tooltip"><div class="name"> Team ' + d.constructorId.toUpperCase().replace(/[\s_]+\w/g, myUpper) +'</div><div class="wins"> wins <span style="color:red">' + d.wins  +  '</div></div>';
        });

    tipTotal = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            var myUpper = function (match) {
                return match.replace(/[\s_]+/, ' ').toUpperCase();
            }
            return '<div class="tooltip"><div class="name"> Team ' + d.constructorId.toUpperCase().replace(/[\s_]+\w/g, myUpper) +'</div><div class="wins"> Total wins <span style="color:red">' + d.wins  +  '</div></div>';
        });


    namesDrivers = {}; //init labels
    // This code cannot be placed in a seperated function because of the async nature of js.
    //parent
    var time_line = d3.select("#wrap_timeline");
    var selected_driver_1 = data.drivers[driver1].career;
    var selected_driver_2 = data.drivers[driver2].career;
    var selected_constructors = [];

    var minYear_1 = selected_driver_1[0].year;
    var minYear_2 = selected_driver_2[0].year;

    var maxYear_1 = selected_driver_1[selected_driver_1.length-1].year;
    var maxYear_2 = selected_driver_2[selected_driver_2.length-1].year;

    var minY; //abs min
    var maxMinY; //voor doorsnede, toch niet gebruikt
    if(minYear_1<minYear_2){
        minY = minYear_1;
        maxMinY = minYear_2;
    }
    else{
        minY = minYear_2;
        maxMinY = minYear_1;
    }

    var maxY; //absoluut max
    var minMaxY; //voor doorsnede, toch niet gebruikt
    if(maxYear_2<maxYear_1){
        maxY = maxYear_1;
        minMaxY = maxYear_2;
    }
    else{
        maxY = maxYear_2;
        minMaxY =maxYear_1;
    }

    var dummy =[];
    // get the constructors for the years that the driver was active
    for (var yearI = minY; yearI < maxY; yearI++) {
        if(yearI in data.constructors){
            dummy.push(yearI);
            var constructors = data.constructors[yearI];
            var year2= newConstructorDataTypes(yearI, constructors, data.drivers);


            selected_constructors.push(year2);
        }

    }

    console.log(maxY-minY);
    console.log(selected_driver_1.length);
    console.log(selected_driver_2.length);
    console.log(selected_driver_1);
    console.log(selected_driver_2);
    selected_driver_1 = fill_career_advanced(minY,maxY,selected_driver_1);
    selected_driver_2 = fill_career_advanced(minY,maxY,selected_driver_2);
    console.log(selected_driver_1);
    console.log(selected_driver_2);


    updateXAxis(selected_constructors);

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

    // create one global svg, so that the trend line can be drawn
    // other svg's for each year will be appended to this one instead of 
    // of being inserted into the year div
    var wrapperSVG = d3.select('#timeline').append('svg')
        .attr("width", totalWidth)
        .attr("height", height)
        .attr("id", "wrapperSVG");

    wrapperSVG.call(tip1);
    wrapperSVG.call(tip2);

    wrapperSVG.call(tipSelectedDriver);




    /* Initialise the specifications of the combined SVG */
    var svgs = wrapperSVG.selectAll("svg").data(dummy).enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("x", function (d, i) {
            var left = width * i;
            return left;
        });


//    var stats = d3.select("#wrap-stats");
//
//    var driver_stats = stats.selectAll("div")
//        .data(selected_driver)
//        .enter()
//        .append("div")
//        .attr("class", "stat")
//        .attr("style", "width:" + width + "px")
//        .html(function (d, i) {
//            var html = new EJS({
//                url: 'tpl/stats2.ejs'
//            }).render({
//                driver1: d
//            })
//
//            return html;
//
//        });


    // draw all the elements of the barchart
    createTimeLineNav2(selected_driver_1,selected_driver_2, selected_constructors, data, driver1,driver2);
    drawTrendLine(wrapperSVG, selected_driver_1,1);
    drawTrendLine(wrapperSVG, selected_driver_2,2);
    console.log(driver1);
    console.log(driver2);
    drawConstructors(wrapperSVG, selected_constructors, data, driver1,driver2);
    drawDriver(wrapperSVG, selected_driver_1,1);
    drawDriver(wrapperSVG, selected_driver_2,2);

    divideInBlocks(wrapperSVG);

    // divideInBlocks(svgs);
    // drawEvents(svgs);
    // drawAxis(svgs);
    //    
    // stopLoadingAnimation();

}

//
//function putInNavigator(wrapperSVG){
//    d3.select("#timelineNav").select(function() {
//        return this.appendChild(document.getElementById("wrapperSVG"));
//    });
//
//}


function stopLoadingAnimation() {
    $("#loader").fadeOut(1500, function (event) {
        $(event.target).remove();
    })
}


// Draw the bars for the constructors
function drawConstructors(svgs, selected_constructors, data, selectedDriverID1,selectedDriverID2) {

    var gs = svgs.selectAll("years")
        .data(selected_constructors)
        .enter()
        .append("svg")
        .attr("x", function (d, i) {
            return i * width;
        }).attr("width", width);

    gs.selectAll("rectTeam").data(function (d) {
        return d;
    }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            if ((d.ids.second == selectedDriverID1 || d.ids.second == selectedDriverID2) &&(d.ids.first == selectedDriverID1 || d.ids.first == selectedDriverID2)  ) {
                return y(d.wins);
            }
            return 0;
        })
        .attr("height", function (d) {
            if ((d.ids.second == selectedDriverID1 || d.ids.second == selectedDriverID2) &&(d.ids.first == selectedDriverID1 || d.ids.first == selectedDriverID2) ) {
                return height - y(d.wins);
            }
            return 0;
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        })
        .on('mouseover', tipTotal.show)
        .on('mouseout', tipTotal.hide);

    gs.selectAll("rect").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2 ) {
                return 0;
            }
            return y(d.wins);
        })
        .attr("height", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2) {
                return 0;
            }
            return height - y(d.ids.secondWins);
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        })
        .on("click", function (d) {
            changeDriver(data, d.ids.second);
        })
        .on('mouseover', tip2.show)
        .on('mouseout', tip2.hide);

    gs.selectAll("rect3").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2) {
                return y(d.wins);
            }
            return y(d.ids.firstWins);
        })
        .attr("height", function (d) {
            if (d.ids.first == selectedDriverID1||d.ids.first == selectedDriverID2) {
                return 0;
            }
            return height - y(d.ids.firstWins);
        })
        .attr("class", function (d, i) {
            return "team2 team-" + i;
        })
        .attr("fill-opacity", 0.5)
        .on("click", function (d) {
            changeDriver(data, d.ids.first);
        })
        .on('mouseover', tip1.show)
        .on('mouseout', tip1.hide);
}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriver(svgs, selected_data,nr) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var bars = svgs.selectAll("rect"+nr)
        .data(selected_data);

    var className;
    if(nr == 1){
        className = "one";
    }else{
        className = "two";
    }

    bars.attr('fill', 'red');

    bars.enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            if("dummy" in d){
                return i * width + width/2;
            }
            return width * i + x0(d.constructorId);
        })
        .attr("y", function (d) {
            if(d == "nothing"){
                return y(0);
            }
            var wins = parseInt(d.wins);
            return y(wins);
        })
        .attr("height", 22)
        .attr("class", className)
        //.style("fill", 'red')
        //.style("fill-opacity", .5)
        .on('mouseover', tipSelectedDriver.show)
        .on('mouseout', tipSelectedDriver.hide);

    bars.exit()
        .transition()
        .duration(300)
        .ease('exp')
        .attr('height', 0)
        .remove();

    bars.transition()
        .duration(300)
        .ease("exp")
        .attr("height", function (d) {
            if(d == "nothing"){
                return height - y(0);
            }
            return height - y(d.wins);
        })

}


function drawTrendLine(svg, data,nr) {
    // function to calculate the x position

    var className;
    if(nr == 1){
        className = "one";
    }else{
        className = "two";
    }

    var calculateX = function (d, i) {
        if("dummy" in d){
            return i * width + width/2;
        }
        return i * width + x0(d.constructorId) + x0.rangeBand() / 2;

    }

    // function to calculate the y position
    var calculateY = function (d) {
        if(d == "nothing"){
            return y( 0.3);
        }
        var wins = parseInt(d.wins);
        return y(wins + 0.3);

    }

    // add little circles to where the driver is located
    svg.selectAll(".circle"+nr).data(data).enter()
        .append("circle")
        .attr("class", "circle"+nr)
        .attr("cy", calculateY)
        .attr("cx", calculateX)
        .attr("id", function (d) {
            if(d == "nothing"){
                "nothing";
            }else{
                d.key
            }

        })
        .attr("r", 3);

    // function to draw the line
    var lineFunction = d3.svg.line()
        .x(calculateX)
        .y(calculateY).interpolate("monotone");

    // draw the line
    svg.append("path")
        .attr("class", "trendline"+nr)
        .attr("d", lineFunction(data));
}


/*
Draw the events (change of team for now) 
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
}*/

/*
 * Draws the number of wins axis on each year.
 */
function drawAxis(svgs) {
    svgs.append("g")
        .attr("class", "y axis")
        .call(yAxis)

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

    for (i = 1; i < linesDividers.length; i++) {
        svgs2.append("text")
            .attr("y", y(i))
            .attr("x", 10)
            .text(i)
            .attr("class", "axisText");
    }
}


function createTimeLineNav2(data1,data2, selected_constructors, Alldata, driver1,driver2) {
    //console.log(JSON.stringify(data));
    // select the timeline navigation.
    var time_line_nav = d3.select("#timelineNav");
    var mini_timeline = d3.select("#miniTimeline");
    var selector = $("#selector");

    // get the total number of years to display
    var numberOfYears = data1.length;
    // Calculate the totalwidth of the timeline
    var width1 = $("#timeline .year").width();
    var totalWidth = numberOfYears * width1;


    // calculate scales
    var relativeWidth = 100 / numberOfYears;
    navWidth = $("#timelineNav").width() / numberOfYears;
    navHeight = $("#timelineNav").height() - 10;
    xScale = $("#timelineNav").width() / totalWidth;
    yScale = navHeight / height;




    // Draggable timeline displaying the years
    var years = time_line_nav.selectAll(".year")
        .data(data1).enter()
        .append("div")
        .attr('class', 'year')
        .text(function (d) {
            // the key is the year
            return d.year;
        })
        .attr("style", "width:" + relativeWidth + "%");

    mini_timeline.selectAll("#wrapperSVGMINI").remove();
    var wrapperSVG = mini_timeline.append('svg')
        .attr("width", $("#timelineNav").width())
        .attr("height", 30)
        .attr("id", "wrapperSVGMINI");



    var svgs = wrapperSVG.selectAll("svg").data(data1).enter().append("svg")
        .attr("width", navWidth)
        .attr("height", 30)
        .attr("x", function (d, i) {
            var left = navWidth * i;
            return left;
        });

    drawConstructorsOnNav2(wrapperSVG, selected_constructors, Alldata, driver1,driver2);
    drawDriverOnNav2(wrapperSVG, data1,1);
    drawDriverOnNav2(wrapperSVG, data2,2);

    //    mini_timeline.select(".year2").remove();
    //    var years2 = mini_timeline
    //        .append("div")
    //        .attr('class', 'year2')
    //        .html("<svg width="+totalWidth+" height=\"30\"><use transform=\"scale("+$("#timelineNav").outerWidth()/totalWidth+","+0.12+")\" xlink:href=\"#wrapperSVG\"/></svg>");

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

            $("#wrap-stats").css({
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

    $("#wrapperSVG").draggable({
        axis: 'x',

        drag: function (event) {
            var left = parseInt($(event.target).position().left);

            $("#wrap_timeline").css({
                left: left + "px"
            });
            var factor = -left / totalWidth;
            console.log("factor: " + factor);
            var left1 = width * factor;

            $("#selector").css({
                left: left1
            })

            $("#wrap-stats").css({
                left: left + "px"
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

// Draw the bars for the constructors
function drawConstructorsOnNav2(svgs, selected_constructors, data, selectedDriverID1,selectedDriverID2) {
    var gs = svgs.selectAll("years2")
        .data(selected_constructors)
        .enter()
        .append("svg")
        .attr("x", function (d, i) {
            return i * navWidth;
        }).attr("width", navWidth);

    gs.selectAll("rect5").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", xScale * x0.rangeBand())
        .attr("x", function (d, i) {
            return xScale * x0(d.constructorId);
        })
        .attr("y", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2) {
                return 0;
            }
            return yScale * y(d.wins);
        })
        .attr("height", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2) {
                return 0;
            }
            return yScale * (height - y(d.ids.secondWins));
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        })
        .attr("fill", "white");

    gs.selectAll("rect4").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", xScale * x0.rangeBand())
        .attr("x", function (d, i) {
            return xScale * x0(d.constructorId);
        })
        .attr("y", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2) {
                return yScale * y(d.wins);
            }
            return yScale * y(d.ids.firstWins);
        })
        .attr("height", function (d) {
            if (d.ids.second == selectedDriverID1 ||d.ids.second == selectedDriverID2) {
                return 0;
            }
            return yScale * (height - y(d.ids.firstWins));
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        })
        .attr("fill", "blue");
}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriverOnNav2(svgs, selected_data,nr) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var bars = svgs.selectAll("rect2"+nr)
        .data(selected_data);

    var className;
    if(nr == 1){
        className = 'blue';
    }else{
        className = 'red';
    }

    bars.attr('fill', className);



    bars.enter()
        .append("rect")
        .attr("width", xScale * x0.rangeBand())
        .attr("x", function (d, i) {
            if("dummy" in d){
                return i * navWidth + navWidth/2;
            }
            return navWidth * i + xScale * x0(d.constructorId);
        })
        .attr("y", function (d) {
            var wins = parseInt(d.wins);
            return yScale * y(wins);
        })
        .attr("height", 22)
        .style("fill", className)
        .attr("class", className)
        .style("fill-opacity", .5);

    bars.exit()
        .transition()
        .duration(300)
        .ease('exp')
        .attr('height', 0)
        .remove();

    bars.transition()
        .duration(300)
        .ease("exp")
        .attr("height", function (d) {
            return navHeight - yScale * y(d.wins);
        })

}

function fill_career(min,max,career) {
    var interval = max - min;
    var size = career.length;
    var newCareer = [];
    if (career[0].year == min) {
        for (var i = 0; i < size; i++) {
            newCareer.push(career[i]);

        }
        for (var j = size; j < interval; j++) {
            newCareer.push({constructorId: career[size - 1].constructorId, points: 0, position: "NA", snd: 0, thd: 0, wins: 0, year: max - j, dummy: "DUMMY"});

        }

    } else {
        for (var i2 = 0; i2 < interval - size; i2++) {
            newCareer.push({constructorId: career[0].constructorId, points: 0, position: "NA", snd: 0, thd: 0, wins: 0, year: min + i2, dummy: "DUMMY"});

        }
        for (var j2 = 0; j2 < size; j2++) {
            newCareer.push(career[j2]);

        }
    }

    return newCareer;

}

    function fill_career_advanced(min,max,career){
        var interval = max+1 - min;
        var size = career.length;
        var newCareer = [];
        //newCareer.push({constructorId:career[0].constructorId,points:0,position:"NA",snd:0,thd:0,wins:0,year:min+i2,dummy:"DUMMY"});
        //newCareer.push({constructorId:career[size-1].constructorId,points:0,position:"NA",snd:0,thd:0,wins:0,year:max-j,dummy:"DUMMY"});
        var i = 0;
        for (var y = min; y<max+1;y++){
            if(career[i].year < y){
                newCareer.push({constructorId: career[i].constructorId, points: 0, position: "NA", snd: 0, thd: 0, wins: 0, year: y, dummy: "DUMMY"});
            }else if(career[i].year > y){
                newCareer.push({constructorId: career[i].constructorId, points: 0, position: "NA", snd: 0, thd: 0, wins: 0, year: y, dummy: "DUMMY"});
            }else{
                newCareer.push(career[i]);
                if(i<size-1){
                    i++;
                }
            }
        }
        return newCareer;

    }
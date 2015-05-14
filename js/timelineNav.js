

// should be copy paste of the code in timeline.js, but adapted
function createTimeLineNav2(data1, data2, selected_constructors, Alldata, driver1, driver2) {
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

    //console.log(navWidth);

    var svgs = wrapperSVG.selectAll("svg").data(data1).enter().append("svg")
        .attr("width", navWidth)
        .attr("height", 30)
        .attr("x", function (d, i) {
            var left = navWidth * i;
            return left;
        });

    drawConstructorsNav(wrapperSVG, selected_constructors, Alldata, driver1, driver2);
    drawDriverNav(wrapperSVG, data1, 1);
    drawDriverNav(wrapperSVG, data2, 2);

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
            //console.log("factor: " + factor);
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
            //console.log("factor: " + factor);
            var left1 = width * factor;
            //console.log(left1);
            $("#selector").css({
                left: left1
            })
        }
    });


}






// Draw the bars for the constructors
function drawConstructorsOnNav2(svgs, selected_constructors, data, selectedDriverID1, selectedDriverID2) {
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
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return 0;
            }
            return yScale * y(d.wins);
        })
        .attr("height", function (d) {
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return 0;
            }
            return yScale * (height - y(d.ids[1][metric]));
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        });

    gs.selectAll("rect4").data(function (d) {
            return d;
        }).enter()
        .append("rect")
        .attr("width", xScale * x0.rangeBand())
        .attr("x", function (d, i) {
            return xScale * x0(d.constructorId);
        })
        .attr("y", function (d) {
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return yScale * y(d.wins);
            }
            return yScale * y(d.ids[0][metric]);
        })
        .attr("height", function (d) {
            if (d.ids[1].driver == selectedDriverID1 || d.ids[1].driver == selectedDriverID2) {
                return 0;
            }
            return yScale * (height - y(d.ids[0][metric]));
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        });
}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriverOnNav2(svgs, selected_data, nr) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var bars = svgs.selectAll("rect2" + nr)
        .data(selected_data);

    var className;
    if (nr == 1) {
        className = 'blue';
    } else {
        className = 'red';
    }

    bars.attr('fill', className);



    bars.enter()
        .append("rect")
        .attr("width", xScale * x0.rangeBand())
        .attr("x", function (d, i) {
            if ("dummy" in d) {
                return i * navWidth + navWidth / 2;
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
        .style("fill-opacity", .5)
        .attr("height", function (d) {
            return navHeight - yScale * y(d.wins);
        })

}




// Draw the bars for the constructors
function drawConstructorsNav(svgs, selected_constructors, data, selectedDriverID1, selectedDriverID2) {


    var gs = svgs.selectAll("years2")
        .data(selected_constructors)
        .enter()
        .append("svg")
        .attr("x", function (d, i) {
            return i * navWidth;
        }).attr("width", navWidth);

    var total = gs.selectAll("rectTotalNav").data(function (d) {
        return d;
    }).enter()
        .append("rect")
        .attr("class", "teamTotal");

    var firstDriver = gs.selectAll("rect4").data(function (d) {
        return d;
    }).enter()
        .append("rect")
        .attr("class", "team2");

    var secondDriver = gs.selectAll("rect5").data(function (d) {
        return d;
    }).enter()
        .append("rect")
        .attr("class", "team");

    var bard = [total, firstDriver, secondDriver];

    for (var i = 0; i < bard.length; i++) {
        bard[i]
            .attr("width", xScale *x0.rangeBand())
            .attr("height", function (d) {
                return yScale *(height - y(0.3));
            })
            .attr("x", function (d, i) {
                return xScale *x0(d.constructorId);
            })
            .attr("y", function (d) {
                return yScale *y(0.3);
            })
    }

    // make globally accessible for animation
    barsNav.total = total;
    barsNav.firstDriver = firstDriver;
    barsNav.secondDriver = secondDriver;

}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriverNav(svgs, selected_data, nr) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var barss = svgs.selectAll("rect2" + nr)
        .data(selected_data);

    var className;
    if (nr == 1) {
        className = "one";
    } else {
        className = "two";
    }
    // save the object for global usage
    barsNav[className] = barss;

    barss.enter()
        .append("rect")
        .attr("width",xScale* x0.rangeBand())
        .attr("x", function (d, i) {
            if ("dummy" in d) {
                return i * navWidth + navWidth / 2;
            }
            return navWidth * i + xScale*x0(d.constructorId);
        })
        .attr("y", yScale*y(0.3))
        .attr("height",yScale*( height - y(0.3)))
        .attr("class", className)
        .style("position", 'absolute');
}


function showBarsNav() {

    barsNav.firstDriver
        .transition()
        .duration(300)
        .attr("width", xScale*x0.rangeBand())
        .attr("height", function (d) {
            return navHeight - yScale*y(parseInt(d.ids[1][metric]));
        })
        .attr("x", function (d, i) {
            return xScale*x0(d.constructorId);
        })

        .attr("y", function (d) {
            return yScale*y(parseInt(d.ids[1][metric]))
        })

    //
    barsNav.secondDriver
        .transition()
        .duration(300)
        .attr("width", xScale*x0.rangeBand())
        .attr("height", function (d) {
            return navHeight - yScale*y(parseInt(d.ids[0][metric]) + 0.3);
        })
        .attr("x", function (d, i) {
            return xScale*x0(d.constructorId);
        })
        .attr("y", function (d) {
            return yScale*y(parseInt(d[metric]) + 0.3)
        })

    barsNav.one
        .transition()
        .duration(300)
        .attr("x", function (d, i) {
            if ("dummy" in d) {
                return i * width + width / 2;
            }
            return navWidth * i + xScale * x0(d.constructorId);
        })
        .attr("y", function (d) {
            var wins = parseInt(d[metric]);
            return yScale*y(wins);
        })
        .attr("height", function (d) {
            if (d == "nothing") {
                return navHeight - yScale*y(0);
            }
            return navHeight - yScale*y(parseInt(d[metric]));
        })

    barsNav.two
        .transition()
        .duration(300)
        .attr("x", function (d, i) {
            if ("dummy" in d) {
                return i * navWidth + navWidth / 2;
            }
            return navWidth * i + xScale * x0(d.constructorId);
        })
        .attr("y", function (d) {
            var wins = parseInt(d[metric]);
            return yScale*y(wins + 0.3);
        })
        .attr("height", function (d) {
            if (d == "nothing") {
                return navHeight - yScale*y(0);
            }
            return navHeight - yScale*y(parseInt(d[metric]) + 0.3);
        })
}


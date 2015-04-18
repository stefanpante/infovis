
var navWidth =  300;

var navHeight = 30;
/* Scaling X-axis */
var x0Nav= d3.scale.ordinal().rangeRoundBands([0, navWidth], 0.1);

/* Scaling Y-axis */
var yNav = d3.scale.linear().range([navHeight, 0]);

var xScale;
var yScale;

function createTimeLineNav(data,selected_constructors,Alldata,driver) {
    //console.log(JSON.stringify(data));
    // select the timeline navigation.
    var time_line_nav = d3.select("#timelineNav");
    var mini_timeline = d3.select("#miniTimeline");
    var selector = $("#selector");

    // get the total number of years to display
    var numberOfYears = data.length;
    // Calculate the totalwidth of the timeline
    var width1 = $("#timeline .year").width();
    var totalWidth = numberOfYears * width1 ;


    // calculate the width of each year in the navigation in percentages 
    var relativeWidth = 100 / numberOfYears;

    xScale = $("#timelineNav").width()/totalWidth;
    yScale = navHeight/height;

//    navWidth = $("#timelineNav").width()/numberOfYears ;

//    navHeight = 30;

//    x0Nav = d3.scale.ordinal().rangeRoundBands([0, navWidth], 0.1);
//
//    console.log(x0Nav.rangeBand());
//
//    /* Scaling Y-axis */
//    yNav = d3.scale.linear().range([navHeight, 0]);

    // Draggable timeline displaying the years
    var years = time_line_nav.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year')
        .text(function (d) {
            // the key is the year
            return d.year;
        })
        .attr("style", "width:" + relativeWidth + "%");

    mini_timeline.select("#wrapperSVGMINI").remove();
    var wrapperSVG = mini_timeline.append('svg')
        .attr("width", $("#timelineNav").width())
        .attr("height", 30)
        .attr("id", "wrapperSVGMINI");


    var svgs = wrapperSVG.selectAll("svg").data(data).enter().append("svg")
        .attr("width", navWidth)
        .attr("height", 30)
        .attr("x", function (d, i) {
            var left = navWidth * i;
            return left;
        });

    drawConstructorsOnNav(wrapperSVG, selected_constructors,Alldata,driver);
    drawDriverOnNav(wrapperSVG, data);

//
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
function drawConstructorsOnNav(svgs, selected_constructors,data,selectedDriverID) {
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
        .attr("width", x0Nav2.rangeBand())
        .attr("x", function (d, i) {
            return x0Nav2(d.constructorId);
        })
        .attr("y", function (d) {
            if(d.ids.second == selectedDriverID){
                return 0;
            }
            return yNav2(d.wins);
        })
        .attr("height", function (d) {
            if(d.ids.second == selectedDriverID){
                return 0;
            }
            return navHeight - yNav2(d.ids.secondWins);
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        })
        .attr("fill", "white");

    gs.selectAll("rect4").data(function (d) {
        return d;
    }).enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return x0(d.constructorId);
        })
        .attr("y", function (d) {
            if( d.ids.second == selectedDriverID){
                return y(d.wins);
            }
            return y(d.ids.firstWins);
        })
        .attr("height", function (d) {
            if(d.ids.first == selectedDriverID ){
                return 0;
            }
            return height - y(d.ids.firstWins);
        })
        .attr("class", function (d, i) {
            return "team team-" + i;
        })
        .attr("fill", "blue");
}


// Draw the bars for the drivers on top of the teams bar.
// This is the red bar.
function drawDriverOnNav(svgs, selected_data) {
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 drivers
    var bars = svgs.selectAll("rect2")
        .data(selected_data);

    bars.attr('fill', 'red');

    bars.enter()
        .append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d, i) {
            return navWidth * i + x0Nav(d.constructorId);
        })
        .attr("y", function (d) {
            var wins = parseInt(d.wins);
            return yNav(wins);
        })
        .attr("height", 22)
        .style("fill", 'red')
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
            return navHeight - yNav(d.wins);
        })

}

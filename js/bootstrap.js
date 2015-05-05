$(document).ready(function () {
    loadJSON()

});

$(".changedriver").click(function (event) {
    var driver = $(event.target).data("driver");
    var name = $(event.target).text();
    $("#title .name").text(name);
    $("#wrap_timeline").empty();
    $("#wrapperSVG").remove();
    $("#wrapperSVGMINI").remove();
    $("#timelineNav .year").remove();
    makeBarCharts(window.dat1, oldestDriver, driver);
    oldestDriver = driver;
});

$("#pointSelector").off("click");
$("#pointSelector").on("click", function () {
    if (metric == "wins") {
        metric = "points";
    } else {
        metric = "wins";
    }

    var constructorBars = window.bars.constructorBars;

    for (var i = 0; i < constructorBars.length; i++) {
        var bars = constructorBars[i];
        bars.transition()
            .duration(300)
            .attr("height", height)
            .attr("y", function (d) {
                return y(parseInt(d.sumMetric) + 0.3);
            })
    }
    
    var driverBars = window.bars.driverBars;
     for (var i = 0; i < driverBars.length; i++) {
        var bars = driverBars[i];
        bars.transition()
            .duration(300)
            .attr("height", height)
            .attr("y", function (d) {
            var wins = parseInt(d[metric]);
            return y(wins + 0.3);
        })
    }
    //makeBarCharts(window.dat1, window.driver1, window.driver2);
});
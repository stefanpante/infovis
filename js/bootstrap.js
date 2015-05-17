$(document).ready(function () {
    loadJSON()

});

//$(".changedriver").click(function (event) {
//    var driver = $(event.target).data("driver");
//    var name = $(event.target).text();
//    //$("#title .name").text(name);
//    $("#wrap_timeline").empty();
//    alert("test");
//    $("#wrapperSVG").remove();
//    $("#wrapperSVGMINI").remove();
//    $("#timelineNav .year").remove();
//    makeBarCharts(window.dat1, oldestDriver, driver);
//    oldestDriver = driver;
//});

$("#pointSelector").off("click");
$("#pointSelector").on("click", function () {
    if (metric == "wins") {
        metric = "points";
    } else {
        metric = "wins";
    }
    updateYScale();
    showBars();
    showTrendLine(1);
    showTrendLine(2);
    window.svgs2.remove();
    if (metric == "wins") {
        divideInBlocks(window.wrapperSVG);
    } else {
        divideInBlocks2(window.wrapperSVG);
    }

    //navigator
    showBarsNav(); //w.i.p.
});

$(".switch").click(function (event) {
    $("#wrap_timeline").empty();
    $("#wrapperSVG").remove();
    $("#wrapperSVGMINI").remove();
    $("#timelineNav .year").remove();
    $("#title .name.two").text("Mario Andretti");
        $("#title .name.one").text("Niki Lauda");
    makeBarCharts(window.dat1,"mario_andretti", "lauda");
})
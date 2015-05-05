$(document).ready(function () {
    loadJSON();

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
});
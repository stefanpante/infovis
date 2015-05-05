$(document).ready(function () {
    //var loader = new LoaderAnimation('body');
    //    loader.startAnimation();
    //loadData();
    //loaderAnimation.insertAnimation('body');
    loadJSON()
        /*.then(function(){
                console.log("promise");
            })*/
    ;
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
    //makeBarCharts(window.dat1, window.driver1, window.driver2);
});
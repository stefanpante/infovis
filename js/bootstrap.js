$(document).ready(function(){
    //loadData();
    loadJSON()/*.then(function(){
        console.log("promise");
    })*/;
});

$(".changedriver").click(function(event){
    var driver = $(event.target).data("driver");
    var name =$(event.target).text();
    $("#title .name").text(name);
    $("#wrap_timeline").empty();
    $("#wrapperSVG").remove();
    $("#timelineNav .year").remove();
    makeBarCharts(window.dat1, driver);
})
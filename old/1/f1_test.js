/* gebruik gemaakt van: http://bl.ocks.org/mbostock/3887051 */
/*margins */
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
/* scale x-as voor jaartallen */
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
/* scale x-as per jaartal */
var x1 = d3.scale.ordinal();
/* scale y-as */
var y = d3.scale.linear()
    .range([height, 0]);
var color = {};
color["Benetton"] = "#1f77b4"
color["Ferrari"]= "#d62728";
color["Mercedes"] = "#17becf";
var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("/prototype/Schumacher/data.csv", function(error, data) {
    /* verzamel attribuutnamen, namelijk de teams */
    var teamNames = d3.keys(data[0]).filter(function(key) { return key !== "Year"; });
    data.forEach(function(d) {
        d.teams = teamNames.map(function(name) { return {name: name, value: +d[name] + 0.05}; });
    });
    /* definieer schalen */
    x0.domain(data.map(function(d) { return d.Year; }));
    x1.domain(teamNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.teams, function(d) { return d.value; }); })]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Wins");
    /* plaats in juist jaartal */
    var year = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; });
    /* plaats barchart in juist team */
    year.selectAll("rect")
        .data(function(d) { return d.teams; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color[d.name]; });
    var legend = svg.selectAll(".legend")
        .data(teamNames)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color[d]; });
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
    /* genereer barchart voor Michael Schumacher */
    d3.csv("/prototype/Schumacher/data_ms.csv", function(error, data) {
        var attr = d3.keys(data[0]);
        console.log(attr);
        data.forEach(function (d) {
            d = attr.map(function (name) {
                return {name: name, value: d[name]};
            });
        });
        var ms = svg.selectAll(".state")
            .data(data)
            .enter().append("g")
            .attr("class", "g");
        ms.selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("width", x1.rangeBand()/2)
            .attr("x", function(d) { return x1(d.Team); })
            .attr("y", function(d) { return y(d.Wins); })
            .attr("height", function(d) { return height - y(d.Wins); })
            .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; })
            .style("fill", "#AAAAA8" ); /*momenteel geel, hard coded */
        /* om het in de toekomst generieker te maken, mini poging */
        var drivers = ["Michael Schumacher"];
        var color_drivers = {};
        color_drivers[drivers[0]] = "#AAAAA8";
        var legendMS = svg.selectAll(".legend2")
            .data(drivers)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        legendMS.append("rect")
            .attr("x", width - 100)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return color_drivers[d]; });
        legendMS.append("text")
            .attr("x", width - 100)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
    });
});
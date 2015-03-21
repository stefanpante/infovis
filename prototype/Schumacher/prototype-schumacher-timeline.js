/**
 * Created by pepino on 15.03.15.
 */

 /* Margin, width and height values */
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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

/* Y-axis */
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

/* Coloring of the different F1-constuctors */
var color = {};
color.Benetton = "#1f77b4";
color.Ferrari = "#d62728";
color.Mercedes = "#17becf";

/* Color of the event bars */
var eventColor = 'yellow';

var svgs;

var years;



/* Loading data from the CSV */
d3.csv("prototype/Schumacher/data.csv", function (error, data) { 
    // http://stackoverflow.com/questions/9491885/csv-to-array-in-d3-js
    var teamNames = d3.keys(data[0]).filter(function (key) {
        return key !== "Year";
    });

    data.forEach(function (d) {
        d.teams = teamNames.map(function (name) {
            return {
                name: name,
                value: +d[name] + 0.1
            };
        });
        d.drivers = [];
        d.events = [];
    });

    x0.domain(data[0].teams.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d3.max(d.teams, function (d) {
            return d.value;
        });
    })]);

    /* Call function for organizing the data */
    useTeamData(data);
});



/* Organizing the data for each team and the searched driver. 
For now, we only focus on one driver, namely Michael Schumacher */
function useTeamData(teamdata) {
    d3.csv("prototype/Schumacher/data_ms.csv", function (error, data) {
        var attr = d3.keys(data[0]);
        // console.log(attr);
        
        // Collect the name of the F1-constructor 
        // and number of wins for each team
        data.forEach(function (d) {
            d = attr.map(function (name) {
                return {
                    name: name,
                    value: d[name]
                };
            });
        });   

        // Collects the data for Michael Schumacher
        // That is the team name and number of wins for each year
        var dataSchumacher = {};
        data.forEach(function (d) {
            dataSchumacher[d.Year] = {
                name: "Schumacher",
                value: d.Wins,
                Team: d.Team
            };
        });

        // Checks whether Schumacher changed team
        // Used to add events to the timeline
        var combinedData = [];
        var currentTeam = "no team";
        teamdata.forEach(function (d) {
            var temp = d;
            if (d.Year in dataSchumacher) {
                if (dataSchumacher[d.Year].Team != currentTeam){
                    temp.events.push(dataSchumacher[d.Year].name+" joins team "+dataSchumacher[d.Year].Team );
                    currentTeam = dataSchumacher[d.Year].Team;
                }
                temp.drivers.push(dataSchumacher[d.Year])
            }
            combinedData.push(temp);
        });

        // Call function for creating the bar charts
        // using the array holding the data of the different constructors
        // as well as the data for Michael Schumacher
        makeBarCharts(combinedData);
    });
}



/* Creating the bar charts */
function makeBarCharts(data) {
    // console.log(data);
    
    //parent
    var time_line = d3.select("#wrap_timeline");
    var time_line_nav = d3.select("#timelineNav")
    
    var numberOfYears = data.length;
    var totalWidth = numberOfYears  * 500;
    // var totalTimeLineLength = $('#timeline .year').css("width");
    // for now hardcoded;
    // alert(totalTimeLineLength);

    //years
    years = time_line.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year');

    var relativeWidth = 100 / numberOfYears;

    // Draggable timeline displaying the years
    var years2 = time_line_nav.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year')
        .text(function (d) {
            return d.Year;
        })
        .attr("style", "width:" + relativeWidth + "%");
    
    // Some wizard magic to make the whole thing scalable and draggable
    var width = $("#timelineNav").width();
    
          $("#selector").draggable({
            axis: 'x',
            
          drag: function(event){
              var position = $(event.target).position();
              if(position.left < 0){
                  position.left = 0;
              }
              if(position.left + 300 > width){
                  position.left = width - 300;
              }
              var factor = position.left / width;
              var offset = - factor * totalWidth;
              
              $("#wrap_timeline").css({
                  "left": offset + "px"
              })     
          }
              
        });

    years.append("div").attr('class', 'head').text(function (d) {
        return d.Year
    });


    /* Initialise the specifications of the combined SVG */
    svgs = years.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgs.selectAll("rect")
        .data(function (d) {
            return d.teams;
        })
        .enter().append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d) {
            return x0(d.name);
        })
        .attr("y", function (d) {
            if (isNaN(d.value)) {
                return height;
            }
            return y(d.value);
        })
        .attr("height", function (d) {
            if (isNaN(d.value)) {
                return 0;
            }
            return height - y(d.value);
        })
        .attr("class", "team")
        .style("fill", function (d) {
            return color[d.name];
        });

    // SVG for bar charts (events)
    // Drawing a vertical bar to indicate the driver changed team
    var event = svgs.append("g").selectAll("rect")
        .data(function (d) {
            return d.events;
        })
        .enter().append("rect")
        .attr("width", 10)
        .attr("x", -5)
        .attr("y", 0)
        .attr("height", 500)
        .attr("class", "event")
        .style("fill", eventColor);

    // SVG for the events text
    // Displaying whether the driver changed team
    svgs.append("g").selectAll("text")
        .data(function (d) {
            return d.events;
        })
        .enter().append("text")
        .style("text-anchor", "end")
        .text(function(d) { return d; })
        .attr("fill","red")
        .attr("x", 250)
        .attr("y", 10);

    
    // SVG for the bar charts (number of wins)
    // Drawing the number of wins for the Formula 1 constructors
    svgs.append("g").selectAll("rect")
        .data(function (d) {
            return d.drivers;
        })
        .enter().append("rect")
        .attr("width", x0.rangeBand())
        .attr("x", function (d) {
            return x0(d.Team);
        })
        .attr("y", function (d) {
            if (isNaN(d.value)) {
                return height;
            }
            return y(d.value);
        })
        .attr("height", function (d) {
            if (isNaN(d.value)) {
                return 0;
            }
            return height - y(d.value);
        })
        .style("fill", function (d) {
            // console.log(d);
            return color[d.Team];
        })
        .attr("class", "driver");


    // SVG for the legend of the Y-axis (wins) per year
    // Displaying the wins legend for each year
    svgs.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("stroke","#FFF")
        .style("text-anchor", "end")
        .text("Wins");

}


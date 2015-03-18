/**
 * Created by pepino on 15.03.15.
 */
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

/* scale x-as voor jaartallen */
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var svgs;

var years;


/* scale y-as */
var y = d3.scale.linear()
    .range([height, 0]);


var color = {};
color["Benetton"] = "#1f77b4";
color["Ferrari"] = "#d62728";
color["Mercedes"] = "#17becf";
color["Schumacher"] = 'grey';

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));



d3.csv("prototype/Schumacher/data.csv", function (error, data) { /*asynch http://stackoverflow.com/questions/9491885/csv-to-array-in-d3-js*/
    var teamNames = d3.keys(data[0]).filter(function (key) {
        return key !== "Year";
    });


    data.forEach(function (d) {
        d.teams = teamNames.map(function (name) {
            return {
                name: name,
                value: +d[name] + 0.05
            };
        });
        d.drivers = [];
    });


    x0.domain(data[0].teams.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d3.max(d.teams, function (d) {
            return d.value;
        });
    })]);
    useTeamData(data);
});


function useTeamData(teamdata) {

    d3.csv("prototype/Schumacher/data_ms.csv", function (error, data) {
        var attr = d3.keys(data[0]);
        console.log(attr);
        data.forEach(function (d) {
            d = attr.map(function (name) {
                return {
                    name: name,
                    value: d[name]
                };
            });
        });

      

        //better?
        var mcdata = {};
        data.forEach(function (d) {
            mcdata[d.Year] = {
                name: "Schumacher",
                value: d.Wins,
                Team: d.Team
            };
        });


        var combinedData = [];
        teamdata.forEach(function (d) {

            var temp = d;

            if (d.Year in mcdata) {
                temp.drivers.push(mcdata[d.Year])
            }

            combinedData.push(temp);


        });


        makeBarCharts(combinedData);
    });
}


function makeBarCharts(data) {
    console.log(data);
    //parent
    var time_line = d3.select("#wrap_timeline");
    var time_line_nav = d3.select("#timelineNav")
    var numberOfYears = data.length;
    

    
    var totalWidth = numberOfYears  * 500;
    //var totalTimeLineLength = $('#timeline .year').css("width");
    // for now hardcoded;
    //alert(totalTimeLineLength);

    //years
    years = time_line.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year');

    var relativeWidth = 100 / numberOfYears;

    var years2 = time_line_nav.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year')
        .text(function (d) {
            return d.Year;
        })
        .attr("style", "width:" + relativeWidth + "%");
    

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
              
          },
              
        
        });

    years.append("div").attr('class', 'head').text(function (d) {
        return d.Year
    });

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
            console.log(d);
            return color[d.Team];
        })
        .attr("class", "driver");





}
/* Loading data from the CSV */
var data;
function loadData() {
    d3.csv("data/Schumacher/data.csv", function (error, data) {
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
}

function loadJSON(){
    d3.json("data/data.json", function(err,data){
       setUpAxis(data, function(){
           makeBarCharts(data, "michael_schumacher");
       })
    });
    

}

function setUpAxis(data, callback){
    var constructors = [];
    for(key in data.constructors){
        var year = data.constructors[key];
        for(var j = 0; j < year.length; j ++){
            var constructorId = year[j].constructorId;
            
            if(constructors.indexOf(constructorId) < 0){
                constructors.push(constructorId);
            }
            
        }
       
    }
     console.log(constructors);
    x0.domain(constructors);
    
//    y.domain([0, d3.max(data.constructors, function(d){
//        return d3.max(d.career, function(d){
//            return d.wins;
//        })
//        
//    })])
    // TODO: fixme
    y.domain([0,20]);
    
    callback();
}

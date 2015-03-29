function loadJSON(){
    d3.json("data/data.json", function(err,data){
       setUpAxis(data, function(){
           window.dat1 = data;
           makeBarCharts(data, "vettel");
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

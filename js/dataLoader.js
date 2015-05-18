function loadJSON(){
    d3.json("data/data.json", function(err,data){
       setUpAxis(data, function(){
           window.dat1 = data;
           window.driver1 = "prost";
           window.driver2 = "senna";
           makeBarCharts(data, window.driver1, window.driver2);
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
     //console.log(constructors);
    x0.domain(constructors);

    
    callback();
}

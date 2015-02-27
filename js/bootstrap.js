/**
 *Starts the execution of the animation
 */

(function () {
    // select the present svg element
    var svg = d3.select("svg#test");
    
    // select the path that represents silverstone
    var path = svg.select("path#silverstone"); //,
    //startPoint = pathStartPoint(path);
    var circuit = new Circuit(path);

    // no multiplier, fastest driver
    var schumacher = new Driver("Michael Schumacher", svg, circuit);
    schumacher.setFill("#8d5ba1");
    schumacher.setAverageLapTime(110.9235);
    // Vettel, 
    var vettel = new Driver("Sebastian Vettel", svg, circuit);
    vettel.setMultiplier(1.0306);
    vettel.setAverageLapTime(114.1408);
    vettel.setFill("#0069b4");
    
    // Senna, largest multiplier
    var senna = new Driver("Ayrton Senna", svg, circuit);
    senna.setMultiplier(1.1922);
    senna.setAverageLapTime(131.6279);
    senna.setFill("#7b0041");
    
    schumacher.startAnimation();
    vettel.startAnimation();
    senna.startAnimation();
})();
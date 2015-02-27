 /**
  * Represents a single circuit
  */


/**
 * @param   name    The name of the driver
 * @param   parent  a svg object on which the driver can be drawn
 * @param   circuit representation of the circuit on which the driver is driving
 */
 function Driver(name, parent, circuit) {
     this.name = name;
     this.lapTimes = [];
     this.multiplier = 1;
     this.parent = parent;
     this.circuit = circuit;
     this.fill = "#FF0000";

 };

 Driver.prototype = {
     constructor: Driver,

     setLapTime: function (laptimes) {
         this.laptimes = laptimes;
     },

     getLapTimes: function () {
         return this.laptimes;
     },

     getLapTime: function (i) {
         return this.laptimes[i];
     },

     
     setMultiplier: function (multiplier) {
         this.multiplier = multiplier;
     },
     
     setAverageLapTime: function(averageLapTime){
       //convert lap time from seconds to millisec
       this.averageLapTime = averageLapTime * 1000;  
     },
     
     setFill: function(fill){
         this.fill = fill;
     },

     startAnimation: function () {
         this.marker = this.parent.append("circle");
         this.marker.attr("r", 15)
             .attr("class", "driver")
             .attr("fill", this.fill) 
             .attr("transform", "translate(" + this.circuit.getStartPoint() + ")");
         this.animateDriving();

     },
     animateDriving: function () {
         var _this = this;
         this.marker.transition()
             .ease("linear") // default is cubic-in-out of whateva
             .duration(this.averageLapTime  / (15* this.multiplier)) // this needs to be a function
             .attrTween("transform", this.circuit.translateAlong())
             .each("end", function () {
                 // needed, otherwise function is called in wrong environment;
                 _this.animateDriving();
             });
     }
 }
 function Driver(name, parent, circuit) {
     this.name = name;
     this.lapTimes = [];
     this.multiplier = 1;
     this.parent = parent;
     this.circuit = circuit;

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

     startAnimation: function () {
         this.marker = this.parent.append("circle");
         this.marker.attr("r", 15)
             .attr("class", "driver")
             .attr("transform", "translate(" + this.circuit.getStartPoint() + ")");
         this.animateDriving();

     },
     animateDriving: function () {
         var _this = this;
         this.marker.transition()
             .ease("linear") // default is cubic-in-out of whateva
             .duration(7000 * (this.multiplier)) // this needs to be a function
             .attrTween("transform", this.circuit.translateAlong(path.node()))
             .each("end", function () {
                 // needed, otherwise function is called in wrong environment;
                 _this.animateDriving();
             });
     }
 }
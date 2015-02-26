function Circuit(path) {
    this.path = path;
};

Circuit.prototype = {
    constructor: Circuit,

    getStartPoint: function () {
        var point = this.path.node(0).getPointAtLength(0);
        return point.x + "," + point.y;
    },

    translateAlong: function () {
        var l = this.path.node().getTotalLength();
        return function (i) {
            return function (t) {
                var p = this.path.node().getPointAtLength(t * l);
                return "translate(" + p.x + "," + p.y + ")"; //Move marker
            }
        }
    }
};
/**
 * Represents a single circuit
 */


/**
 * @param path  an svg path which represents the shape of the circuit
 */
function Circuit(path) {
    this.path = path;
};

Circuit.prototype = {
    constructor: Circuit,

    /*
     * Returns the beginpoint of the circuit
     */
    getStartPoint: function () {
        var point = this.path.node(0).getPointAtLength(0);
        return point.x + "," + point.y;
    },

    /**
     * returns a function which can be used to translate an object around the path
     * that represents the circuit.
     */
    translateAlong: function () {
        var _this = this;
        var l = this.path.node().getTotalLength();
        return function (i) {
            return function (t) {
                var p = _this.path.node().getPointAtLength(t * l);
                return "translate(" + p.x + "," + p.y + ")"; //Move marker
            }
        }
    }
};
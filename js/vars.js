var metric = "wins"; //"points" or "wins!"
var width = 500;

var height = $("#timeline").height();
var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1); // x-axis
var y = d3.scale.linear().range([height, 0]); //y

/* Coloring of the different F1-constuctors */
colors = d3.scale.category20();

var navWidth = 300; //temp
var navHeight = 30; //temp

/* Scaling X-axis */
var x0Nav = d3.scale.ordinal().rangeRoundBands([0, navWidth], 0.1);

/* Scaling Y-axis */
var yNav = d3.scale.linear().range([navHeight, 0]);

barsNav={};
bars = {};
selected_constructors = [];
selected_driver_1 = [];
selected_driver_2 = [];
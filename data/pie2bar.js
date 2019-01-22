var fs = require('fs');
var d3 = require('d3');
var d3Gridding = require('d3-gridding');
var JSDOM = require('jsdom').JSDOM;


var output_dir = "output/";
let datasetSize = 40;


// var dataset = [5, 10, 20, 45, 6, 25];
var pie = d3.pie();

var width = 500;
var height = 500;
var color = d3.scaleOrdinal(d3.schemeCategory10);

var outerRadius = width / 2;
var innerRadius = outerRadius - 65; // set to 0 for full bar chart
var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var x = d3.scaleLinear()
    .rangeRound([0, width]);


module.exports = function(outputLocation) {
    if (!outputLocation) outputLocation = 'test.svg';
    const window = (new JSDOM(`<html><head></head><body></body></html>`, { pretendToBeVisual: true })).window;

    window.d3 = d3.select(window.document);

    //Create SVG element
    var svg = window.d3.select('body')
        .append('div').attr('class', 'container') //make a container div to ease the saving process
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height);

    var gridding = d3Gridding.gridding()
        .size([width, height])
        .valueHeight("length")
        .prefix("__")
        .orient("up")
        .mode("vertical");

    d3.range(datasetSize).map(function (d, i) {


        setTimeout(function (d) {

            // cleaning up the DOM
            window.d3.selectAll(".arc").remove();
            window.d3.selectAll("g").remove();

            // Create data
            var dataset = []
            while(dataset.reduce((a, b) => a + b, 0) < 100){
                var r = Math.floor(Math.random()*40) + 1;
                if(dataset.indexOf(r) === -1) dataset.push(r);
            }


            if (dataset.reduce((a, b) => a + b, 0) > 100) {
                var sum = dataset.reduce((a, b) => a + b, 0)
                var index = dataset.length - 1
                dataset[index] = dataset[index] - (sum -100)
            }


            var barPadding = 0;
            var barWidth = (width / dataset.length);
            var coeff = height/Math.max.apply(null, dataset);

            var barChart = svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("y", function(d) {
                    return height - d*coeff;
                })
                .attr("height", function(d) {
                    return d*coeff;
                })
                .attr("width", barWidth - barPadding)
// comment for colored charts
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 2)
// uncomment for colored charts
//                .attr("fill", function(d, i){
//                    return color(i);
//                })
                .attr("transform", function (d, i) {
                     var translate = [barWidth * i, 0];
                     return "translate("+ translate +")";
                });


            fs.writeFileSync(__dirname + '/' + output_dir + "pie" + i + ".svg", window.d3.select('.container').html());

            window.d3.selectAll("rect").remove();


            var arcs = svg.selectAll("g.arc")
                .data(pie(dataset))
                .enter()
                .append("g")
                .attr("class", "arc")
                .style("fill", "none")
                .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");

            // Draw arc paths
            arcs.append("path")
// comment for colored charts
                .attr("stroke", "black")
                .attr("stroke-width", "2px")
// uncomment for colored charts
//                .attr("fill", function(d, i){
//                    return color(i);
//                })
                .attr("d", arc);


            fs.writeFileSync(__dirname + '/' + output_dir + "pie_label" + i + ".svg", window.d3.select('.container').html());

        }, 500);
    });

};

if (require.main === module) {
    module.exports();
}
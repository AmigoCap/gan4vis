var fs = require('fs');
var d3 = require('d3');
var d3Gridding = require('d3-gridding');
var JSDOM = require('jsdom').JSDOM;
var output_dir = "output/";

var width = 500,
    height = 500;
let datasetSize = 40;
var x = d3.scaleLinear()
    .rangeRound([0, width]);


var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];

var color = d3.scaleOrdinal().range(colors);

// based on
// https://gist.github.com/tomgp/c99a699587b5c5465228
module.exports = function (pieData, outputLocation) {

    if (!outputLocation) outputLocation = 'grid.svg';
    const window = (new JSDOM(`<html><head></head><body></body></html>`, {pretendToBeVisual: true})).window;

    window.d3 = d3.select(window.document);

    //do yr normal d3 stuff
    var svg = window.d3.select('body')
        .append('div').attr('class', 'container') //make a container div to ease the saving process
        .append('svg')
        .attr('id', 'svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    // main grid parameters

    var gridding = d3Gridding.gridding()
        .size([width, height])
        .valueHeight("length")
        .prefix("__")
        .orient("up")
        .mode("vertical");


    d3.range(datasetSize).map(function (d, i) {


        // timeout to make sure the DOM has time to be refreshed
        // betweetn every chart
        setTimeout(function (d) {

            // cleaning up the DOM
            svg.selectAll(".square").remove();

            // dataset

            var data = d3.range(1000).map(d3.randomBates(Math.floor(Math.random() * Math.floor(20)) + 0.3));

            var bins = d3.histogram()
                .domain(x.domain())
                .thresholds(x.ticks(Math.floor(Math.random() * Math.floor(16)) + 3))
                (data);


            // update the grid library with new data
            var griddingData = gridding(bins);
            console.log("writing image #", i);

            svg.selectAll(".square")
                .data(griddingData)
                .enter().append("rect")
                .style("fill", "none")
                .style("stroke", "black")
                .attr("class", "square")
                .attr("width", function (d) {
                    return d.__width;
                })
                .attr("height", function (d) {
                    return d.__height;
                })
                .attr("transform", function (d) {
                    return "translate(" + d.__x + "," + d.__y + ")";
                });

            // write out the children of the container div
            fs.writeFileSync(__dirname + '/' + output_dir + "vertical" + i + ".svg", window.d3.select('.container').html());
            svg.selectAll(".square").remove();

            svg.selectAll(".square")
                .data(griddingData)
                .enter().append("rect")
                .style("fill", function (d, i) {
                    return color(i)
                })
                .style("stroke", "black")
                .attr("class", "square")
                .attr("width", function (d) {
                    return d.__width;
                })
                .attr("height", function (d) {
                    return d.__height;
                })
                .attr("transform", function (d) {
                    return "translate(" + d.__x + "," + d.__y + ")";
                });
            fs.writeFileSync(__dirname + '/' + output_dir + "vertical_label" + i + ".svg", window.d3.select('.container').html())
        }, 500);
    });
};

if (require.main === module) {
    module.exports();
}

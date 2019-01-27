var d3 = require('d3');
var JSDOM = require('jsdom').JSDOM;

var margin = {
  "top": 50,
  "bottom": 50,
  "left": 50,
  "right": 50
}


var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

//if (!outputLocation) outputLocation = 'grid.svg';
const window = (new JSDOM(`<html><head></head><body></body></html>`, {
  pretendToBeVisual: true
})).window;

window.d3 = d3.select(window.document);

var fs = require('fs');
var plot_data = JSON.parse(fs.readFileSync('barchart_data.json', 'utf8'));

var svg = window.d3.select('body')
  .append('div').attr('class', 'container') //make a container div to ease the saving process
  .append('svg')
  .attr('id', 'svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.bottom + margin.top)

for (var i = 0; i < Object.keys(plot_data).length; i++) {
  svg.selectAll("*").remove();

  data = []

  for (var j = 0; j < plot_data[i].x_values.length; j++) {
    data.push({
      "value": plot_data[i].y_values[j],
      "letter": plot_data[i].x_ticks[j]
    })
  }

  var xScale = d3.scaleBand()
    .domain(data.map(function(d) {
      return d.letter;
    }))
    .rangeRound([0, width])
    .paddingInner(0.1)

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) {
      return d.value;
    })])
    .range([height, 0])

  var xAxis = d3.axisBottom()
    .scale(xScale)

  var yAxis = d3.axisLeft()
    .scale(yScale)

  var yAxis = d3.axisLeft()
    .scale(yScale)


  var color = d3.scaleOrdinal(d3.schemeCategory20)


  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => margin.left + xScale(d.letter))
    .attr("y", d => margin.top + yScale(d.value))
    .attr("height", d => height - yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "none")

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
    .call(xAxis)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
    .call(yAxis)

  svg.append("g")
    .append("text")
    .attr("x", width / 2)
    .attr("y", 2 * margin.top / 3)
    .attr("font-size", 18)
    .text("My Bar Chart")

  svg.append("g")
    .append("text")
    .attr("x", margin.left / 2)
    .attr("y", 2 * margin.top / 3)
    .text("y axis")

  svg.append("g")
    .append("text")
    .attr("x", margin.left + width)
    .attr("y", margin.top + height + 1 * margin.bottom / 3 + 5)
    .text("x axis")

  fs.writeFileSync("output/barchart_label" + i + ".svg", window.d3.select('.container').html());
}
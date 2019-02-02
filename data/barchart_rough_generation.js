var d3 = require('d3');
var rough = require('roughjs');
var JSDOM = require('jsdom').JSDOM;

var margin = {
  "top": 40,
  "bottom": 40,
  "left": 40,
  "right": 40
}

var width = 420;
var height = 420;

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

const rc = rough.svg(window.document.getElementById('svg'));

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

  var color = d3.scaleOrdinal(d3.schemeCategory20)

  data.forEach(function(d, i) {
    let node = rc.rectangle(
      margin.left + xScale(d.letter),
      margin.top + yScale(d.value),
      xScale.bandwidth(),
      height - yScale(d.value), {
        roughness: 100,
        fill: color(i),
        fillStyle: "zigzag",
        fillWeight: 1,
        // hachureGap: 10
      }
    );
    window.document.getElementById('svg').appendChild(node);
  });

  // svg.append("g")
  //   .attr("class", "axis")
  //   .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
  //   .call(xAxis)
  //
  // svg.append("g")
  //   .attr("class", "axis")
  //   .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
  //   .call(yAxis)

  fs.writeFileSync("output/barchart_label" + i + ".svg", window.d3.select('.container').html());
}
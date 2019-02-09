var d3 = require('d3');
var fs = require('fs');
var JSDOM = require('jsdom').JSDOM;

var dest_dir = process.argv[2]
var animation_index = process.argv[3]


const window = (new JSDOM(`<html><head></head><body></body></html>`, {
  pretendToBeVisual: true
})).window;

window.d3 = d3.select(window.document);

// Feel free to change or delete any of the code you see in this editor!
var nb_items = 4,
    width = 256,
    height = 256;


var svg = window.d3.select("body")
  .append('div').attr('class', 'container')
  .append("svg")
  .attr("width", width)
  .attr("height", height)

function main(nb_series, target_dir) {
  var data = d3.range(nb_series).map(d3.randomUniform(1))
  

  function bar_chart(el, data, x_begin, y_begin, w, h) {
    
    var x = d3.scaleBand()
      .domain(Array(data.length ).fill(1).map((x, y) => x + y - 1))
      .range([x_begin, x_begin + w])
      .paddingInner(10)
    
    var y = d3.scaleLinear()
      .domain([0, 1])
      .range([y_begin + h, y_begin])
    
    var color_scale = d3.scaleOrdinal(d3.schemeCategory20)
    
    el.append("g")
      .selectAll("rect")
      .data(data).enter()
      .append("rect")
      .attr("x", function(d, i) { return x(i) })
      .attr("y", d => y(d))
      .attr("width", w / data.length)
      .attr("height", d => y_begin + h - y(d))
      .attr("fill", function(d, i) { return color_scale(i); })
    
    
    var total = d3.sum(data)
    
    var rel_values = [data.map(d => d/total)]
    
    var color_scale = d3.scaleOrdinal(d3.schemeCategory10)
    
    var pie = d3.pie()
      .sort(null)
      .value(d => d)(data);
    
    var arc_f = function(dict) {
      return d3.arc()
        .outerRadius(dict.outerRadius)
        .innerRadius(dict.innerRadius)
        .startAngle(dict.startAngle)
        .endAngle(dict.endAngle)
    }
    
    
    g = el.append("g")
      .attr("transform", "translate(" + w/2 + ", " + h/2 + ")")
      
    svg.selectAll("rect").remove()

    g.selectAll("arc")
      .data(pie)
      .enter().append("g")
      .attr("class", "arc")
      .append("path")      
      .attr("d", arc_f(h/2 - 20, h/2, w/2, h/2))
      .style("fill", function(d, i) { return color_scale(i); })
      .transition()
      .duration(1910)
      .tween("arc", arcTween)

    function arcTween(d) {
      
        var path = d3.select(this)
        i = 0
            
        return function(t) {
          x0 = x_begin + x(d.index),
          y0 = y_begin + h - y(d.data);

          var r = h / 2 / Math.min(1, t + 1e-4), 
              a = Math.cos(t * Math.PI / 2),
              xx = ((a) * (-r + x0 + x.step()) + (1 - a) * w / 2),
              yy = a * (y_begin) + a*a*a* h + (1-a) * h / 2,
              f = {
                innerRadius: a * (r - (x.step() - 10)) + (1 - a) * (r - 20), 
                outerRadius: r,  
                startAngle: a * (Math.PI / 2 - y0/r)  + (1 - a) * d.startAngle,
                endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
              }; 

          path.attr("transform", "translate(" + xx + "," + yy + ")");
          path.attr("d", arc_f(f));
          //text.attr("transform", "translate(" + arc.centroid(f) + ")translate(" + xx + "," + yy + ")rotate(" + ((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
          
          // Reference to the folder from the project root
          if (d.index == 3) {
            //console.log(compteurs[animation_index]++, d.index, t, animation_index)
            fs.writeFileSync(target_dir + "barchart_label" + animation_index + "_t" + i++ + ".svg", window.d3.select('.container').html());
          }
          
        };
    }
  }
  bar_chart(svg, data, 0, 0, 128, 128)
}

console.log("Saving to directory: ")
console.log(process.cwd())

main(nb_items, dest_dir)

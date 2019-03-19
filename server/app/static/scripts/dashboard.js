var parser = function(table){
  var parseDateRaw = d3.timeParse("%a, %d %b %Y %H:%M:%S GMT");
  var formatDate = d3.timeFormat("%m/%d/%Y")
  for (var i=0; i<table.length;i++){
    table[i].date = formatDate(parseDateRaw(table[i].date))
    table[i]["number_points"] = table[i].datapoints.split(",").length
  }
  document.getElementById("number_applications").innerHTML = "<b>Style Transfers: </b>" + table.length;
  return table
}

var draw_line_chart_submission = function(table){
  var parseDate = d3.timeParse("%m/%d/%Y")
  var width = document.getElementById("line_chart_submission").offsetWidth
  var height = document.getElementById("line_chart_submission").offsetWidth*1/2
  var margin = {"left":35,"right":25,"top":40,"bottom":40}

  var svg = d3.select("#line_chart_submission")
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")


  var nested_table = d3.nest()
    .key(function(d) {
      return d.date;
    })
    .rollup(function(v) {
      return v.length
    })
    .entries(table)

  var cumulated_values = [];
  var sum = 0;

  for (var i=0; i<nested_table.length; i++){
    sum += nested_table[i].value
    cumulated_values.push({"date":nested_table[i].key,"sum":sum})
  }

  var xScale = d3.scaleTime()
    .domain([d3.min(cumulated_values, d => parseDate(d.date)), d3.max(cumulated_values, d => parseDate(d.date))])
    .range([margin.left,width-margin.right])

  var yScale = d3.scaleLinear()
    .domain([0,d3.max(cumulated_values,function(d){
      return d.sum
    })])
    .range([height - margin.top,margin.bottom])

  var xAxis = d3.axisBottom()
    .tickFormat(d3.timeFormat("%d %b"))
    .scale(xScale)

  var yAxis = d3.axisLeft()
    .scale(yScale)

  var line = d3.line()
    .x(function(d) {
      return xScale(parseDate(d.date))
    })
    .y(function(d) {
      return yScale(d.sum)
    })

  svg.append("path")
    .datum(cumulated_values)
    .attr('fill', 'none')
    .attr("stroke", "steelblue")
    .attr('stroke-width', width/250)
    .attr("d", line)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (0) + ", " + (height - margin.bottom) + ")")
    .call(xAxis)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + ", 0)")
    .call(yAxis)

  svg.append("g")
    .append("text")
    .attr("x",margin.left)
    .attr("y", margin.top*5/8)
    .text("Style Transfer Applications");

  var tooltip = d3.select("#line_chart_submission").append('div')
    .attr('class', 'hidden tooltip');

  svg.selectAll("circle")
    .data(cumulated_values)
    .enter()
    .append("circle")
    .attr("cx",function(d){
      return xScale(parseDate(d.date))
    })
    .attr("cy",function(d){
      return yScale(d.sum)
    })
    .attr("r",width/175)
    .attr("fill", "steelblue")
    .on('mousemove', function(d) {
      var mouse = d3.mouse(d3.select("#line_chart_submission").node()).map(function(d) {
        return parseInt(d);
      });
      tooltip.classed('hidden', false)
        .style("top", (d3.event.pageY) - width/20 + "px")
        .style("left", (d3.event.pageX) + width/75 + "px")
        .style("width","auto")
        .html(d.date + ": <b>" + d.sum +"</b>");

      d3.select(this)
          .attr("fill", "orange");
    })
    .on('mouseout', function() {
      d3.select(this)
          .attr("fill", "steelblue");
      tooltip.classed('hidden', true);
    });
}

var draw_combination_chart = function(table){
  var width = document.getElementById("chart_combination").offsetWidth
  var height = document.getElementById("chart_combination").offsetWidth*3/4
  var margin = {"left":110,"right":10,"top":40,"bottom":40}

  var svg = d3.select("#chart_combination")
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")

  var nested_table = d3.nest()
    .key(function(d) {
      return d.distribution;
    })
    .key(function(d) {
      return d.grid;
    })
    .rollup(function(v) {
      return v.length
    })
    .entries(table)

  var grouped_data = []
  var grid_max = ""
  var distribution_max = ""
  var max = 0

  for (var i=0; i<nested_table.length; i++){
    for (var j=0; j<nested_table[i].values.length; j++){
      if (max<nested_table[i].values[j].value){
        distribution_max = nested_table[i].key
        grid_max = nested_table[i].values[j].key
        max = nested_table[i].values[j].value
      }
      grouped_data.push({"distribution":nested_table[i].key,"grid":nested_table[i].values[j].key,"value":nested_table[i].values[j].value})
    }
  }

  document.getElementById("best_combinations").innerHTML = "<b>Best Combination: </b>" + grid_max + " + " + distribution_max;

  var xScale = d3.scalePoint()
    .domain(["vertical","horizontal","treemap"])
    .range([margin.left,width-margin.right])
    .padding(0.5)

  var yScale = d3.scalePoint()
    .domain(["random","d3.randomBates","d3.randomExponential","linear"])
    .range([height-margin.top,margin.bottom])
    .padding(0.8)

  var rScale = d3.scaleLinear()
    .domain([0,d3.max(grouped_data,function(d){return d.value})])
    .range([0,width/15])

  var xAxis = d3.axisBottom()
    .scale(xScale)

  var yAxis = d3.axisLeft()
    .scale(yScale)

  var tooltip = d3.select("#chart_combination").append('div')
    .attr('class', 'hidden tooltip');

  svg.selectAll("circle")
    .data(grouped_data)
    .enter()
    .append("circle")
    .attr("cx", function(d,i){
      return xScale(d.grid)
    })
    .attr("cy", function(d,i){
      return yScale(d.distribution)
    })
    .attr("r", d => rScale(d.value))
    .attr("fill","steelblue")
    .on('mousemove', function(d) {
      var mouse = d3.mouse(d3.select("#chart_combination").node()).map(function(d) {
        return parseInt(d);
      });
      tooltip.classed('hidden', false)
        .style("top", (d3.event.pageY) - width/12 + "px")
        .style("left", (d3.event.pageX) + width/50 + "px")
        .style("width","auto")
        .html(d.grid + " + " + d.distribution + ": <b>"+ d.value + "</b>");

      d3.select(this)
          .attr("fill", "orange");
    })
    .on('mouseout', function() {
      d3.select(this)
          .attr("fill", "steelblue");
      tooltip.classed('hidden', true);
    });

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (0) + ", " + (height - margin.bottom) + ")")
    .call(xAxis)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + ", 0)")
    .call(yAxis)

  svg.append("g")
    .append("text")
    .attr("x",margin.left)
    .attr("y", margin.top*5/8)
    .text("Grid / Distribution Popularity");
}

var draw_bar_chart = function(table,id_div,key_name,type,title){
  var width = document.getElementById(id_div).offsetWidth
  var height = document.getElementById(id_div).offsetWidth*11/16
  var margin = {"left":35,"right":25,"top":25,"bottom":25}

  var svg = d3.select("#"+id_div)
    .append("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")

  var nested_table = d3.nest()
    .key(function(d) {
      return d[key_name];
    })
    .rollup(function(v) {
      return v.length
    })
    .entries(table)

  var xScale = d3.scaleBand()
    .range([margin.left,width-margin.right])
    .padding(0.1)

  if (type === "cardinal"){
    xScale.domain(d3.range(d3.min(nested_table, d => +d.key), d3.max(nested_table, d => +d.key)+1))
  } else {
    xScale.domain(d3.range(nested_table.length).map(function(i){return nested_table[i].key}))
    if (key_name === "model"){
      var max = 0
      var model_max = ""
      for (var i=0; i<nested_table.length; i++){
        if (max<nested_table[i].value){
          model_max = nested_table[i].key
          max = nested_table[i].value
        }
      }
      document.getElementById("best_models").innerHTML = "<b>Best Model: </b>" + model_max;
    }
  }

  var yScale = d3.scaleLinear()
    .domain([0, d3.max(nested_table, d => d.value)])
    .range([height-margin.top,margin.bottom])


  var xAxis = d3.axisBottom()
    .scale(xScale)

  // Only show a x tick every four tick
  if (key_name === "number_points"){
    l = d3.range(d3.min(nested_table, d => +d.key), d3.max(nested_table, d => +d.key)+1)
    xAxis.tickValues(l.filter(function(d){
      return d%5 === 0 // Only display tick values like 0, 5, 10, ...
    }))
  }


  var yAxis = d3.axisLeft()
    .scale(yScale)

  var tooltip = d3.select("#"+id_div).append('div')
    .attr('class', 'hidden tooltip');


  svg.selectAll("rect")
    .data(nested_table)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.key))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => yScale(0) - yScale(d.value))
    .attr("fill","steelblue")
    .on('mousemove', function(d) {
      var mouse = d3.mouse(d3.select("#"+id_div).node()).map(function(d) {
        return parseInt(d);
      });
      tooltip.classed('hidden', false)
        .style("top", (d3.event.pageY) - width/12 + "px")
        .style("left", (d3.event.pageX) + width/70 + "px")
        .style("width","auto")
        .html(d.key + ": <b>"+ d.value + "</b>");

      d3.select(this)
          .attr("fill", "orange");
    })
    .on('mouseout', function() {
      d3.select(this)
          .attr("fill", "steelblue");
      tooltip.classed('hidden', true);
    });

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (0) + ", " + (height - margin.bottom) + ")")
    .call(xAxis)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + ", 0)")
    .call(yAxis)

  svg.append("g")
    .append("text")
    .attr("x",margin.left)
    .attr("y", margin.top*5/8)
    .text(title);
}

var dashboard_data = parser(dashboard_data)
draw_line_chart_submission(dashboard_data)
draw_combination_chart(dashboard_data)
draw_bar_chart(dashboard_data,"bar_chart_model","model","ordinal","Models Popularity")
draw_bar_chart(dashboard_data,"bar_chart_number_points","number_points","cardinal","Datapoints Number Popularity")
draw_bar_chart(dashboard_data,"bar_chart_ratio","ratio","cardinal","Zoom Ratio Popularity")

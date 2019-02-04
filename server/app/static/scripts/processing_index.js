$("#apply_style_button").click(function() {
  $.ajax({
    url: "/treatment",
    type: "POST",
    data: JSON.stringify({
      "image": ajax_binary_image
    }),
    contentType: "application/json; charset=utf-8",
    success: function(response) {
      console.log(response);
    }
  })
});

var width = 450,
  height = 300;

var gridding = d3.gridding()
  .size([width - 20, height - 20])
  .offset([10, 10])
  .valueHeight("__value")
  .orient("up")
  .mode("vertical");

var nb_data = 10
var data = generate_data(nb_data); // default random

var current_property = 0;
var current_distribution = "random";

var all_modes = ["horizontal", "vertical", "treemap"];

// Manage user interaction by detecting keydown event
d3.select("body")
  .on("keydown", function(d) {
    var k = d3.event.keyCode;

    var current_mode = gridding.mode();

    // g: change grid
    if (k === 71) {
      gridding.mode(all_modes[(all_modes.indexOf(current_mode) + 1) % all_modes.length])
      console.log("new mode: ", gridding.mode())
      draw();

      current_property = 0; // then if go through properties start with 1st one
    }

    // d: change distribution
    if (k === 68) {

      current_distribution = distributions[(distributions.indexOf(current_distribution) + 1) % distributions.length];
      console.log(current_distribution)
      data = generate_data(nb_data, current_distribution);
      draw();
    }

    // r: redraw
    if (k === 82) {
      data = generate_data(nb_data, current_distribution);
      console.log("new valueWidth: ", gridding.valueWidth());
      draw();
    }

    // o: change orientation
    if (k === 79) {
      var o = ["up", "down", "left", "right"]; // , "top right"
      var new_orient = o[(o.indexOf(gridding.orient()) + 1) % o.length];
      gridding.orient(new_orient);
      console.log("new orient: ", gridding.orient());
      draw();
    }

    // // h: change valueHeight
    // if (k === 72) {
    // 	if (gridding.valueHeight() === null) {
    // 		gridding.valueHeight("__value");
    // 	} else {
    // 		gridding.valueHeight(null);
    // 	}
    //
    // 	console.log("new valueHeight: ", gridding.valueHeight());
    // 	draw();
    // }
    //
    // // w: change valueWidth
    // if (k === 87) {
    // 	if (gridding.valueWidth() === null) {
    // 		gridding.valueWidth("__value");
    // 	} else {
    // 		gridding.valueWidth(null);
    // 	}
    //
    // 	console.log("new valueWidth: ", gridding.valueWidth());
    // 	draw();
    // }

    // +
    if (k === 39) {
      nb_data++;
      data = generate_data(nb_data, current_distribution);
      console.log("new size: ", nb_data)
      draw();
    }

    // -
    if (k === 37) {
      nb_data--;
      data = generate_data(nb_data, current_distribution);
      console.log("new size: ", nb_data)
      draw();
    }

  })

// Create the preview chart
var svg = d3.select("#preview")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

function draw() {

  var griddingData = gridding(data);

  var squares = svg.selectAll(".square")
    .data(griddingData);

  squares.enter().append("rect")
    .attr("class", "square")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("width", function(d) {
      return d.width;
    })
    .attr("height", function(d) {
      return d.height;
    })
    .attr("transform", function(d) {
      return "translate(" + (d.x) + "," + (d.y) + ")";
    });

  squares.transition()
    .attr("width", function(d) {
      return d.width;
    })
    .attr("height", function(d) {
      return d.height;
    })
    .attr("transform", function(d) {
      return "translate(" + (d.x) + "," + (d.y) + ")";
    })
    .on("end", function() {
      render_image();
    })

  squares.exit().remove();

  // var indexes = svg.selectAll(".index")
  // 	.data(griddingData);

  // indexes.enter().append("text")
  // 	.attr("class", "index")
  // 	.style('text-anchor', 'middle')
  // 	.style('dominant-baseline', 'central')
  // 	.attr("transform", function(d) {
  // 		return "translate(" + d.cx + "," + d.cy + ")";
  // 	})
  // 	.text(function(d, i) {
  // 		return d.__value;
  // 	});

  // indexes.transition()
  // 	.attr("transform", function(d) {
  // 		return "translate(" + d.cx + "," + d.cy + ")";
  // 	})
  // 	.text(function(d, i) {
  // 		return d.__value;
  // 	});
  //
  // indexes.exit().remove();
}

// result image
// d3.select("#result").append('img')
//   .attr('width', width)
//   .attr('height', height)
//   .attr("id", "render-final")
//   .attr("src", "img/placeholder.png");

// Define variable to be passed in AJAX
var ajax_binary_image;

// from svg to png https://gist.github.com/vicapow/758fce6aa4c5195d24be
function render_image() {

  d3.select("#render-canvas").remove();
  d3.select("#render-img").remove();

  // serialize our SVG XML to a string.
  var source = (new XMLSerializer()).serializeToString(d3.select('svg').node());

  var doctype = '<?xml version="1.0" standalone="no"?>' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  // create a file blob of our SVG.
  var blob = new Blob([doctype + source], {
    type: 'image/svg+xml;charset=utf-8'
  });

  var url = window.URL.createObjectURL(blob);

  // Put the svg into an image tag so that the Canvas element can read it in.
  var img = d3.select('body').append('img')
    .attr('width', 400)
    .attr('height', 300)
    .style("display", "none")
    .attr("id", "render-img")
    .node();

  img.onload = function() {
    // Now that the image has loaded, put the image into a canvas element.
    var canvas = d3.select('body').append('canvas').attr("id", "render-canvas").style("display", "none").node();
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    var canvasUrl = canvas.toDataURL("image/png");

    // var img2 = d3.select('body').select("#render-final")
    //   .node();

    // this is now the base64 encoded version of our PNG! you could optionally
    // redirect the user to download the PNG by sending them to the url with
    // `window.location.href= canvasUrl`.
    // img2.src = canvasUrl;
    ajax_binary_image = canvasUrl
  }

  // start loading the image.
  img.src = url;
}

draw();

setTimeout(function() {
  render_image();
}, 1000);

var distributions = [
  "random", "d3.randomBates", "d3.randomExponential", "linear"
]

// s: size of the dataset
// d: type of distribution (default random)
// p: parameter (if available for the distribution)
function generate_data(s, d = "random", p) {

  var data = [];

  if (d === "d3.randomBates") {
    data = d3.range(1000).map(d3.randomBates(10));
  } else if (d === "d3.randomExponential") {
    data = d3.range(1000).map(d3.randomExponential(10));
  } else if (d === "linear") {
    data = [];
    d3.range(1000).map(function(d) {
      d3.range(d).map(function(e) {
        data.push(d);
      })
    });
  } else if (d === "random") { // default random
    data = d3.range(1000).map(Math.random);
  }

  var x = d3.scaleLinear()
    .rangeRound([0, width]);

  console.log(data)

  var bins = d3.histogram()
    .domain(x.domain())
    //.thresholds(x.ticks(s))
    .thresholds(d3.range(0, 1, 1 / s))
    (data);

  return bins.map(function(d) {
    return d.length;
  });
}
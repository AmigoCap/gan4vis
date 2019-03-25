// Image Style selection
image_style_selected = transfer.model

// Show the handsontable if the screen is big enough
window.onload = function(){
  if ($(document).width()<992){
    document.getElementById("hot").style.display = "none"
  } else {
    document.getElementById("hot").style.display = "block"
  }
}

var image_click = function(image){
   $('.selected').removeClass('selected'); // removes the previous selected class
   $(image).addClass('selected'); // adds the class to the clicked image
   image_style_selected = document.getElementsByClassName("image_style selected")[0].id
};

// AJAX Query
$("#apply_style_button").on("touchstart click", function(){
    $.ajax({
      url: "/treatment",
      type: "POST",
      data: JSON.stringify({
        "image": ajax_binary_image, // Send the binary of the input chart image
        "model": image_style_selected,
        "distribution": current_distribution,
        "datapoints": data.join(','),
        'grid': gridding.mode(),
        'orientation': gridding.orient(),
        'ratio': current_ratio
      }),
      contentType: "application/json; charset=utf-8",
      beforeSend: function() {
        document.getElementById("spinning_wheel").style.visibility = "visible";    /*showing  a div with spinning image */
      },
      success: function(response) {
        document.getElementById("spinning_wheel").style.visibility = "hidden";
        document.getElementById("download_button").style.visibility = "visible" //show the download option
        $("#result_image").attr("src", "static/output_images/" + response + ".jpg") //Update the result image
        document.getElementById('download_link').setAttribute("href","static/output_images/" + response + ".jpg") //Update the download target
        history.pushState(window.location.href, "index", "?token=" + response)
      }
    })
  });


var width = 450,
  height = 300;

// Initialization of the ratios
var current_ratio = transfer.ratio; // Get the initial ratio from the server
var ratios = [1,2,3,4,5,6,7,8,9,10]

var gridding = d3.gridding() // Declare the grid
  .size([width - 20*current_ratio, height - 20*current_ratio]) //Change the ratio depending on current_ratio
  .offset([10*current_ratio, 10*current_ratio]) //Change the ratio depending on current_ratio
  .valueHeight("__value")
  .orient(transfer.orientation)
  .mode(transfer.grid);

//Declare variables to draw
var nb_data;
var data; //datapoints
var current_property = 0; //
var current_distribution = transfer.distribution; //distribution


// Complete declaration with values.
// If the token is not the placeholder use datapoints from the database. Otherwise, use random points
if (transfer.token !== "placeholder") {
  data = transfer.datapoints.split(",").map(Number);
  nb_data = data.length;
  data_handson = data.map(function(d,i){
    return({
      index: i,
      value: d,
      __selected: false,
      __highlighted: false
    })
  })
} else {
  nb_data = 10;
  data = generate_data(nb_data);
  data_handson = data.map(function(d,i){
    return({
      index: i,
      value: d,
      __selected: false,
      __highlighted: false
    })
  })
}

var all_modes = ["horizontal", "vertical", "treemap"];

var distribution_change = function() {
  current_distribution = distributions[(distributions.indexOf(current_distribution) + 1) % distributions.length];
  console.log("current distribution", current_distribution)
  data = generate_data(nb_data, current_distribution);
  data_handson = data.map(function(d,i){
    return({
      index: i,
      value: d,
      __selected: false,
      __highlighted: false
    })
  })
  hot.updateSettings({
    data: data_handson
  });
  draw();
}

var add_point = function() {
  nb_data++;
  data.push(Math.floor(d3.mean(data)))
  data_handson = data.map(function(d,i){
    return({
      index: i,
      value: d,
      __selected: false,
      __highlighted: false
    })
  })
  hot.updateSettings({
    data: data_handson
  });
  console.log("new size: ", nb_data)
  draw();
}

var remove_point = function() {
  if (nb_data == 1){
  } else {
    nb_data--;
    data.pop()
    data_handson = data.map(function(d,i){
      return({
        index: i,
        value: d,
        __selected: false,
        __highlighted: false
      })
    })
    hot.updateSettings({
      data: data_handson
    });
    console.log("new size: ", nb_data)
    draw();
  }
}

var randomize = function() {
  data = generate_data(nb_data, current_distribution);
  data_handson = data.map(function(d,i){
    return({
      index: i,
      value: d,
      __selected: false,
      __highlighted: false
    })
  })
  hot.updateSettings({
    data: data_handson
  });
  console.log("new valueWidth: ", gridding.valueWidth());
  draw();
}


var change_grid = function() {
  var current_mode = gridding.mode();
  gridding.mode(all_modes[(all_modes.indexOf(current_mode) + 1) % all_modes.length])
  console.log("new mode: ", gridding.mode())
  draw();
  current_property = 0; // then if go through properties start with 1st one
}

var change_orientation = function() {
  var o = ["up", "down"]; // , "top right"
  var new_orient = o[(o.indexOf(gridding.orient()) + 1) % o.length];
  gridding.orient(new_orient);
  console.log("new orient: ", gridding.orient());
  draw();
}

// Function to zoom on the chart
var ratio_increase = function() {
  if (ratios.indexOf(current_ratio) === 0){
  } else {
    current_ratio = ratios[(ratios.indexOf(current_ratio) - 1) % ratios.length]
  }
  gridding.size([width - 20*current_ratio, height - 20*current_ratio])
  gridding.offset([10*current_ratio, 10*current_ratio])
  draw();
}

// Function to decrease the zoom
var ratio_decrease = function(){
  if (ratios.indexOf(current_ratio) === ratios.length-1){
  } else {
    current_ratio = ratios[(ratios.indexOf(current_ratio) + 1) % ratios.length]
  }
  gridding.size([width - 20*current_ratio, height - 20*current_ratio])
  gridding.offset([10*current_ratio, 10*current_ratio])
  draw();
}

// Manage user interaction by detecting click event on artificial keys
d3.select("#key_d")
  .on("click", function(d) {
    distribution_change()
  })

d3.select("#key_add")
  .on("click", function(d) {
    add_point()
  })

d3.select("#key_remove")
  .on("click", function(d) {
    remove_point()
  })

d3.select("#key_randomize")
  .on("click", function(d) {
    randomize()
  })

d3.select("#key_grid")
  .on("click", function(d) {
    change_grid()
  })

d3.select("#key_orientation")
  .on("click", function(d) {
    change_orientation()
  })

d3.select("#key_ratio_increase")
  .on("click", function(d) {
    ratio_increase()
  })

d3.select("#key_ratio_decrease")
  .on("click", function(d) {
    ratio_decrease()
  })

// Manage user interaction by detecting keydown event
d3.select("body")
  .on("keydown", function(d) {
    var k = d3.event.keyCode;

    var current_mode = gridding.mode();

    // g: change grid
    if (k === 71) {
      change_grid()
    }

    // d: change distribution
    if (k === 68) {
      distribution_change()
    }

    // r: redraw
    if (k === 82) {
      randomize()
    }

    // o: change orientation
    if (k === 79) {
      change_orientation()
    }

    // r: ratio increase
    if (k === 87) {
      ratio_increase()
    }

    // r: ratio decrease
    if (k === 72) {
      ratio_decrease()
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
    // //
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
      add_point()
    }

    // -
    if (k === 37) {
      remove_point()
    }

  })

// Create the preview chart
var svg = d3.select("#preview")
  .append("svg")
  .attr("id", "svg_preview")
  .attr("xmlns","http://www.w3.org/2000/svg")
  .attr("viewBox", "0 0 " + width + " " + height)
  .attr("perserveAspectRatio", "xMinYMid")

function draw() {
  var griddingData = gridding(data_handson.map(a => a.value));

  var squares = svg.selectAll(".square")
      .data(griddingData)//, function(d, i) { return d[var_id]; })

  squares.enter().append("rect")
    .attr("class", "square")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("width", function(d) {
      return d.width;
    })
    .attr("height", function(d) {
      console.log(d)
      return d.height;
    })
    .attr("transform", function(d) {
      return "translate(" + (d.x) + "," + (d.y) + ")";
    })
    .on("click", function(d, i) {
      if ($(document).width()<992){
      } else {
        d3.event.stopPropagation();

        data_handson.forEach(function(e) {
          e.__selected = false;
        });

        data_handson[i].__selected = true;

        hot.selectCell(data_handson[i][var_id], 0);
      }
    })

  squares.transition()
    .attr("width", function(d) {
      return d.width;
    })
    .attr("height", function(d) {
      return d.height;
    })
    .style("fill", function(d,i) {
      if(data_handson[i].__selected) {
        return "red";
      } else {
        return "white";
      }
    })
    .attr("transform", function(d) {
      return "translate(" + (d.x) + "," + (d.y) + ")";
    })
    .on("end", function() {
      render_image();
    })

  squares.exit().remove();

  // var indexes = svg.selectAll(".index")
  // 	.data(griddingData, function(d, i) { return d[var_id]; });
  //
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
  //
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

// Define variable to be passed in AJAX
var ajax_binary_image;

function neutralize(){
  // Remove the red fill
  var svg = d3.select("#svg_preview")
  svg.selectAll("rect")
    .style('fill', 'white')
}

function activate(){
  // Set the red fill
  var svg = d3.select("#svg_preview")
  svg.selectAll("rect")
    .style('fill', function(d,i){
      if (data_handson[i].__selected === true){
        return "red"
      } else {
        return "white"
      }
    })
}

// from svg to png https://gist.github.com/vicapow/758fce6aa4c5195d24be
function render_image() {
  neutralize() // Export the canvas without the red fill

  d3.select("#render-canvas").remove();
  d3.select("#render-img").remove();

  // console.log(d3.select('svg').node())

  // serialize our SVG XML to a string.
  var source = (new XMLSerializer()).serializeToString(d3.select('svg').node());

  source = source.replace('viewBox="0 0 450 300"', 'width="' + width + 'px"') //Tinkering with string to remove the effect of responsive
  source = source.replace('perserveAspectRatio="xMinYMid"', 'height="' + height + 'px"')

  source.replace()

  var doctype = '<?xml version="1.0" standalone="no"?>' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  // create a file blob of our SVG.
  // var blob = new Blob([doctype + source], {
  //   type: 'image/svg+xml;charset=utf-8'
  // });
  //
  // console.log(blob)
  //
  // var url = window.URL.createObjectURL(blob);
  //
  // console.log(url)

  // Put the svg into an image tag so that the Canvas element can read it in.
  //
  // var img = d3.select('body').append('img')
  //   .attr('width', 400)
  //   .attr('height', 300)
  //   .style("display", "none")
  //   .attr("id", "render-img")
  //   .node();

  // console.log("///",img)

  // Use image to store the encoded svg
  var img = new Image();
  img.src = 'data:image/svg+xml;utf8,' + doctype + source;

  // console.log('data:image/svg+xml;utf8,' + doctype + source)
  // console.log(img.src)

  img.addEventListener('load',function() {
    // Now that the image has loaded, put the image into a canvas element.
    var canvas = d3.select('body').append('canvas').attr("id", "render-canvas").style("display", "none").node();
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    var canvasUrl = canvas.toDataURL("image/png");

    // console.log(canvasUrl)

    // this is now the base64 encoded version of our PNG! you could optionally
    // redirect the user to download the PNG by sending them to the url with
    // `window.location.href= canvasUrl`.
    // img2.src = canvasUrl;
    ajax_binary_image = canvasUrl
  })

  activate() //restore the red fill
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

  var bins = d3.histogram()
    .domain(x.domain())
    // .thresholds(x.ticks(s))
    .thresholds(d3.range(0, 1, 1 / s))
    (data)//.map(a => a.value))

  return bins.map(function(d) {
    return d.length;
  });
}

var hotElement = document.querySelector('#hot');
var hotElementContainer = hotElement.parentNode;
var var_id = "index";
var var_value = var_id;

var hotSettings = {
  data: data_handson,
  className: "htLeft",
  columns: [
    {
      data: 'value',
      type: 'numeric',
    }
  ],
  width: document.getElementById("charts").offsetWidth/16,
  height: document.getElementById("hot").offsetWidth*3.75,
  colWidths: document.getElementById("hot").offsetWidth * 4/5,
  autoWrapRow: true,
  afterChange: function() {
    console.log("afterChange")
    data = data_handson.map(a => a.value)
    draw();
  },
  afterSelection: function (changes, source) {
    data_handson.forEach(function(d) {
      d.__selected = false;
    })

    var sel = hot.getSelected();

    data_handson[sel[0][0]].__selected = true;
    draw();
  },
  afterDocumentKeyDown: function(a, b) {
    console.log("afterDocumentKeyDown", a, b)
  }
};

var hot = new Handsontable(hotElement, hotSettings);

d3.select("body").append("button").on("click", function() {
  current_layout = layouts[(layouts.indexOf(current_layout) + 1) % layouts.length];
  draw()
});

window.onresize = function(){
  if ($(document).width()<992){
    document.getElementById("hot").style.display = "none"
  } else {
  }
}

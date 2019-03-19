// https://github.com/romsson/d3-gridding Version 0.0.11. Copyright 2018 Romain Vuillemot.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-scale'), require('d3-array'), require('d3-hierarchy'), require('d3-shape')) :
	typeof define === 'function' && define.amd ? define('d3-gridding', ['exports', 'd3-scale', 'd3-array', 'd3-hierarchy', 'd3-shape'], factory) :
	(factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Scale,d3Array,d3Hierarchy,d3Shape) { 'use strict';

var brick = function(nodes, v) {

  if(!v.shiftX) {
    v.shiftX = 1/2;
  }

  if(!v.shiftY) {
    v.shiftY = 1/2;
  }

  var _cols = Math.ceil(Math.sqrt(nodes.length));
  var _rows = Math.ceil(nodes.length / _cols);

  v.x.domain([0, _cols]).range([0, v.size[0] - v.size[0] / _cols]);
  v.y.domain([0, _rows]).range([0, v.size[1] - v.size[1] / _rows]);

  nodes.forEach(function(n, i) {

    var col = i % _cols;
    var row = Math.floor(i / _cols);

    n[v.__x] = v.x(col) + v.offset[0] + v.padding;
    n[v.__y] = v.y(row) + v.offset[1] + v.padding;

    n[v.__width] = v.x.range()[1] / _cols - 2 * v.padding;
    n[v.__height] = v.y.range()[1] / _rows - 2 * v.padding;

    if(v.orient === "left") {
      if(row % 2 === 1) {
        n[v.__x] += n[v.__width] * v.shiftX;
      }
    } else if(v.orient === "up") {
      if(col % 2 === 1) {
        n[v.__y] += n[v.__height] * v.shiftY;
      }
    } else if(v.orient === "down") {
      if(col % 2 === 0) {
        n[v.__y] += n[v.__height] * v.shiftY;
      }
    } else if(v.orient === "right") {
      if(row % 2 === 0) {
        n[v.__x] += n[v.__width] * v.shiftX;
      }
    } else if(v.orient === "none") {
      n[v.__x] += 0;
      n[v.__y] += 0;
    } else { // default right
      if(row % 2 === 0) {
        n[v.__x] += n[v.__width] * v.shiftX;
      }
    }

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var central = function(nodes, v) {

  nodes.forEach(function(n) {

    n[v.__x] = 0 + v.padding + v.offset[0];
    n[v.__y] = 0 + v.padding + v.offset[1];

    n[v.__width] = v.size[0] - 2 * v.padding;
    n[v.__height] = v.size[1] - 2 * v.padding;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;

    n[v.__tx] = n[v.__cx] / 2;
    n[v.__ty] = v.padding / 2;

    n[v.__lx] = n[v.__cx] + v.padding / 2;
    n[v.__ly] = 0;

    n[v.__rx] = n[v.__cx] - v.padding / 2;
    n[v.__ry] = n[v.__yx] / 2;
  });

  return nodes;
};

var cascade = function(nodes, v) {

  var shiftX = v.size[0] / (2 * nodes.length);
  var shiftY = v.size[1] / (2 * nodes.length);

  nodes.forEach(function(n, i) {

    n[v.__x] = 0 + v.offset[0] + shiftX * i;
    n[v.__y] = 0 + v.offset[1] + shiftY * i;

    n[v.__width] = v.size[0] - shiftX * nodes.length;
    n[v.__height] = v.size[1] - shiftY * nodes.length;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var coordinate = function(nodes, v) {

  var _valueX, _valueXmax;

  // Create random data if no value function has been set
  if(!v.valueX) {
    _valueX = function() { return Math.random(); };
    _valueXmax = 1;
  } else if(typeof v.valueX === "function" && typeof v.valueX(nodes[0]) === "string" && v.valueX(nodes[0]).indexOf("px") === v.valueX(nodes[0]).length - 2) {
    _valueX = function(d) { return +v.valueX(d).replace("px", ""); };
    _valueXmax = v.size[0];
  } else if(typeof v.valueX === "string") {
    _valueX = function(d) { return d[v.valueX]; };
    _valueXmax = d3Array.max(nodes, _valueX);
  } else {
    _valueX = v.valueX;
    _valueXmax = d3Array.max(nodes, _valueX);
  }

  v.x.domain([0, _valueXmax]).range([0, v.size[0]]);

  var _valueY, _valueYmax;

  // Same as for X, create random data for vertical axis
  if(!v.valueY) {
    _valueY = function() { return Math.random(); };
    _valueYmax = 1;
  } else if(typeof v.valueY === "function" && typeof v.valueY(nodes[0]) === "string" && v.valueY(nodes[0]).indexOf("px") === v.valueY(nodes[0]).length - 2) {
    _valueY = function(d) { return +v.valueY(d).replace("px", ""); };
    _valueYmax = v.size[1];
  } else if(typeof v.valueY === "string") {
    _valueY = function(d) { return d[v.valueY]; };
    _valueYmax = d3Array.max(nodes, _valueY);
  } else {
    _valueY = v.valueY;
    _valueYmax = d3Array.max(nodes, v.valueY);
  }

  v.y.domain([0, _valueYmax]).range([0, v.size[1]]);

  var _valueWidth;

  if(!v.valueWidth) {
    _valueWidth = function() { return 1; };
    v.width.domain([0, nodes.length]).range([0, v.size[0]]);
  } else if(typeof v.valueWidth === "function" && typeof v.valueWidth(nodes[0]) === "string" && v.valueWidth(nodes[0]).indexOf("px") === v.valueWidth(nodes[0]).length - 2) {
    _valueWidth = function(d) { return +v.valueWidth(d).replace("px", ""); };
    v.width.domain([0, _valueXmax]).range([0, v.size[0]]);
  } else if(typeof v.valueWidth === "string") {
    _valueWidth = function(d) { return d[v.valueWidth]; };
    v.width.domain([0, _valueXmax]).range([0, v.size[0]]);
  } else if(typeof v.valueWidth === "number") { // proportion
    _valueWidth = function() { return v.valueWidth; };
    v.width.domain([0, v.size[0]]).range([0, v.size[0] - 2 * v.padding]);
  } else { // function
    _valueWidth = v.valueWidth;
    v.width.domain([0, _valueXmax]).range([0, v.size[0]]);
  }

  var _valueHeight;

  if(!v.valueHeight) {
    _valueHeight = function() { return 1; };
    v.height.domain([0, nodes.length]).range([0, v.size[1]]);
  } else if(typeof v.valueHeight === "function" && typeof v.valueHeight(nodes[0]) === "string" && v.valueHeight(nodes[0]).indexOf("px") === v.valueHeight(nodes[0]).length - 2) {
    _valueHeight = function(d) { return +v.valueHeight(d).replace("px", ""); };
    v.height.domain([0, _valueYmax]).range([0, v.size[1]]);
  } else if(typeof v.valueWidth === "string") { // pixels
    _valueHeight = function(d) { return d[v.valueHeight]; };
    v.height.domain([0, _valueYmax]).range([0, v.size[1]]);
  } else if(typeof v.valueWidth === "number") { // proportion
    _valueHeight = function() { return v.valueHeight; };
    v.height.domain([0, v.size[0]]).range([0, v.size[1] - 2 * v.padding]);
  } else { // function
    _valueHeight = v.valueHeight;
    v.height.domain([0, _valueYmax]).range([0, v.size[1]]);
  }

  // Preveting overflows
  // v.x.range([0, v.size[0] - v.width(_valueWidth(nodes[0]))]);
  // v.width.range([0, v.size[0] - v.width(_valueWidth(nodes[0]))]);
  // v.y.range([0, v.size[1] - v.height(_valueHeight(nodes[0]))]);
  // v.height.range([0, v.size[1] - v.height(_valueHeight(nodes[0]))]);

  nodes.forEach(function(n) {


    n[v.__x] = v.x(_valueX(n)) + v.offset[0] + v.padding;
    n[v.__y] = v.y(_valueY(n)) + v.offset[1] + v.padding;

    n[v.__width] = v.width(_valueWidth(n)) - 2 * v.padding;
    n[v.__height] = v.height(_valueHeight(n)) - 2 * v.padding;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;

  });

  return nodes;
};

var corner = function(nodes, v) {

  var shiftX = v.size[0] / (2 * nodes.length);
  var shiftY = v.size[1] / (2 * nodes.length);

  var _valueWidth;

  if(!v.valueWidth) {
    _valueWidth = function(d, i) { return i; };
    v.width.domain([0, nodes.length]).range([0, v.size[0] - 2 * v.padding]);
  } else if(typeof v.valueWidth === "number") {
    _valueWidth = function() { return v.valueWidth; };
    v.width.domain([0, v.size[0]]).range([0, v.size[0] - 2 * v.padding]);
  } else {
    _valueWidth = v.valueWidth;
    v.width.domain([0, d3Array.max(nodes, _valueWidth)]).range([0, v.size[0] - 2 * v.padding]);
  }

  var _valueHeight;

  if(!v.valueHeight) {
    _valueHeight = function(d, i) { return i; };
    v.height.domain([0, nodes.length]).range([0, v.size[1] - 2 * v.padding]);
  } else if(typeof v.valueHeight === "number") {
    _valueHeight = function() { return v.valueHeight; };
    v.height.domain([0, v.size[1]]).range([0, v.size[1] - 2 * v.padding]);
  } else {
    _valueHeight = v.valueHeight;
    v.height.domain([0, d3Array.max(nodes, _valueHeight)]).range([0, v.size[1] - 2 * v.padding]);
  }

  nodes.forEach(function(n, i) {

    n[v.__width] = v.size[0] - shiftX * i * 2;
    n[v.__height] = v.size[1] - shiftY * i * 2;

    if(v.orient === "top right") {

      n[v.__x] = v.size[0] - n.width + v.offset[0];
      n[v.__y] = 0 + v.offset[1];

    } else if(v.orient === "bottom right") {

      n[v.__x] = v.size[0] - n[v.__width] + v.offset[0];
      n[v.__y] = v.size[1] - n[v.__height] + v.offset[1];

    } else if(v.orient === "bottom left") {

      n[v.__x] = 0 + v.offset[0];
      n[v.__y] = v.size[1] - n[v.__height] + v.offset[1];

    } else if(v.orient === "top") {

      n[v.__width] = v.width(_valueWidth(n, i)) - 2 * v.margin;
      n[v.__height] = v.height(_valueHeight(n, i)) - 2 * v.margin;

      n[v.__x] = 0 + v.offset[0] + (v.size[0] / 2) - (n[v.__width] / 2) + v.padding;
      n[v.__y] = 0 + v.offset[1] + v.padding;

    } else if(v.orient === "bottom") {

      n[v.__width] = v.width(_valueWidth(n, i)) - 2 * v.margin;
      n[v.__height] = v.size[1] - 10 - 3*i;// v.height(_valueHeight(n, i)) - 2 * v.margin;

      n[v.__x] = 0 + v.offset[0] + (v.size[0] / 2) - (n[v.__width] / 2) + 2 * i;
      n[v.__y] = 0 + v.offset[1] + v.size[1] - n[v.__height];

    } else if(v.orient === "middle") {

      n[v.__width] = v.width(_valueWidth(n, i)) - 2 * v.margin;
      n[v.__height] = v.height(_valueHeight(n, i)) - 2 * v.margin;

      n[v.__x] = 0 + v.offset[0] + (v.size[0] / 2) - (n[v.__width] / 2);
      n[v.__y] = 0 + v.offset[1] + (v.size[1] / 2) - (n[v.__height] / 2);

    } else { // default top

      n[v.__x] = 0 + v.offset[0];
      n[v.__y] = 0 + v.offset[1];
      n[v.__width] = v.width(_valueWidth(n, i)) - 2 * v.margin;
      n[v.__height] = v.height(_valueHeight(n, i)) - 2 * v.margin;

    }

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var diagonal = function(nodes, v) {

  v.x.domain([0, nodes.length]).range([0, v.size[0]]);
  v.y.domain([0, nodes.length]).range([0, v.size[1]]);

  nodes.forEach(function(n, i) {

    if(v.orient == "up") {
      n[v.__x] = v.x(i) + v.offset[0] + v.padding;
      n[v.__y] = v.size[1] - (v.y(i) + v.offset[1]) - v.size[1] / nodes.length + v.padding;
    } else {
      n[v.__x] = v.x(i) + v.offset[0] + v.padding;
      n[v.__y] = v.y(i) + v.offset[1] + v.padding;
    }

    n[v.__width] = v.size[0] / nodes.length - 2 * v.padding;
    n[v.__height] = v.size[1] / nodes.length - 2 * v.padding;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var grid = function(nodes, v) {

  if(v.sort) {
    nodes = nodes.sort(v.sort);
  }

  var _cols;

  if(!v.cols) {
    _cols = Math.ceil(Math.sqrt(nodes.length));
  } else {
    _cols = v.cols;
  }

  var _rows;

  if(!v.rows) {
    _rows = Math.ceil(nodes.length / _cols);
  } else {
    _rows = v.rows;
  }

  if(v.cellSize) {
    v.size[0] = v.cellSize[0] * _cols;
    v.size[1] = v.cellSize[1] * _rows;
  }

  v.width.domain([0, nodes.length]).range([v.margin, v.size[0] - 2 * v.padding - 2 * v.margin]);
  v.height.domain([0, 1]).range([0, v.size[1] - 2 * v.padding - 2 * v.margin]);

  v.x.domain([0, _cols]).range([v.margin, v.size[0] - v.margin]);
  v.y.domain([0, _rows]).range([v.margin, v.size[1] - v.margin]);

  nodes.forEach(function(n, i) {

    var col = i % _cols;
    var row = Math.floor(i / _cols);

    n[v.__x] = v.x(col) + v.offset[0] + v.padding;
    n[v.__y] = v.y(row) + v.offset[1] + v.padding;

    n[v.__width] = (v.size[0] - 2 * v.margin) / _cols - 2 * v.padding ;
    n[v.__height] = (v.size[1] - 2 * v.margin) / _rows - 2 * v.padding;

    if(v.orient == "up") {
      n[v.__y] = v.size[1] - n[v.__y] - n[v.__height];
    } else if(v.orient == "down") {
      n[v.__y] = v.y(row) + v.offset[1] + v.padding;
    } else if(v.orient == "left") {
      n[v.__y] = v.y(row) + v.offset[1] + v.padding;
    } else if(v.orient == "right") {
      n[v.__y] = v.y(row) + v.offset[1] + v.padding;
    } else { // default down
      n[v.__y] = v.y(row) + v.offset[1] + v.padding;
    }

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;

    n.tx = n[v.__x] + n[v.__width] / 2;
    n.ty = v.padding / 2;
  });

  return nodes;
};

var horizontal = function(nodes, v) {

  if(v.sort) {
    nodes = nodes.sort(v.sort);
  }

  var _valueHeight;

  if(!v.valueHeight) {
    _valueHeight = function() { return 1; };
    v.height.domain([0, nodes.length]).range([0, v.size[1] - 2 * v.padding]);
  } else {
    _valueHeight = v.valueHeight;
    v.height.domain([0, d3Array.sum(nodes, _valueHeight)]).range([0, v.size[1] - 2 * v.padding]);
  }

  var _valueWidth;

  if(!v.valueWidth) {
    _valueWidth = function() { return 1; };
    v.width.domain([0, 1]).range([0, v.size[0] - 2 * v.padding]);
  } else {
    _valueWidth = v.valueWidth;
    v.width.domain([0, d3Array.max(nodes, _valueWidth)]).range([0, v.size[0] - 2 * v.padding]);
  }

  if(nodes.length > 0) {
    nodes[0].y0 = v.padding;
  }

  nodes.forEach(function(n, i) {

    n[v.__y] = n.y0 + v.offset[1] + v.margin;

    if(v.orient === "right") {
      n[v.__x] = 0 + v.offset[0] + v.padding + v.margin;
    } else if(v.orient === "left") {
      n[v.__x] = v.size[0] - v.width(_valueWidth(n))  + v.offset[0] - v.padding + v.margin;
   } else if(v.orient === "up") {
      n[v.__x] = 0 + v.offset[0] + v.padding + v.margin;
     // n[v.__y] = v.size[1] - n.y0 - v.height(_valueHeight(n)) - v.offset[1] - v.margin;
    } else if(v.orient === "center") {
      n[v.__x] = (v.size[0] / 2) - v.width(_valueWidth(n)) / 2 + v.offset[0] + v.margin;
    } else { // defaut right
      n[v.__x] = 0 + v.offset[0] + v.padding + v.margin;
    }

    n[v.__width] = v.width(_valueWidth(n)) - 2 * v.margin;
    n[v.__height] = v.height(_valueHeight(n));

    // Updates the next node's y0 for all nodes but the last one
    if(i < nodes.length - 1) {
      nodes[i+1].y0 = n.y0 + n[v.__height];
    }

    n[v.__height] -= 2 * v.margin;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var identity = function(nodes, v) {

  nodes.forEach(function(n) {

    n[v.__x] = n[v.__x] || 0;
    n[v.__y] = n[v.__y] || 0;

    n[v.__width] = n[v.__width] || v.size[0];
    n[v.__height] = n[v.__height] || v.size[1];

    n[v.__cx] = n[v.__cx] || n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__cy] || n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var pack$1 = function(nodes, v) {

  var pack$$1 = d3Hierarchy.pack()
      .size([v.size[0], v.size[1]])
      .padding(v.padding);

  var packed = pack$$1(d3Hierarchy.stratify()
      .id(function(d, i) { return i; })
      .parentId(function(d, i) {
        return i === 0 ? "": 0;
      })([{}].concat(nodes))
        .sum(function() { return 1; })
      );

  var _valueWidth;

  if(!v.valueWidth) {
    _valueWidth = function(_, i) { return packed.children[i].r; };
    v.width.domain([0, 1]).range([0, 1]);
  } else if(typeof v.valueWidth === "number") {
    _valueWidth = function() { return v.valueWidth; };
    v.width.domain([0, v.size[0]]).range([0, v.size[0] - 2 * v.padding]);
  } else {
    _valueWidth = v.valueWidth;
    v.width.domain(d3Array.extent(nodes, v.valueX)).range([0, v.size[0]]);
  }

  var _valueHeight;

  if(!v.valueHeight) {
    _valueHeight = function(_, i) { return packed.children[i].r; };
    v.width.domain([0, 1]).range([0, 1]);
  } else if(typeof v.valueHeight === "number") {
    _valueHeight = function() { return v.valueHeight; };
    v.height.domain([0, v.size[1]]).range([0, v.size[1] - 2 * v.padding]);
  } else {
    _valueHeight = v.valueHeight;
    v.height.domain(d3Array.extent(nodes, v.valueY)).range([0, v.size[1]]);
  }

  nodes.forEach(function(n, i) {
    n[v.__x] = packed.children[i].x + v.offset[0];
    n[v.__y] = packed.children[i].y + v.offset[1];

    n[v.__width] = v.width(_valueWidth(n, i));
    n[v.__height] = v.height(_valueHeight(n, i));

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var rotate = function(cx, cy, x, y, a) {
  var r = (Math.PI / 180) * a,
      cos = Math.cos(r),
      sin = Math.sin(r),
      resx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      resy = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [resx, resy];
};

var pyramid = function(nodes, v) {

  var shiftX, shiftY;

  nodes.forEach(function(n, i) {

    if(v.orient == "bottom") {

      shiftX = v.size[0] / (2 * nodes.length);
      shiftY = v.size[1] / (2 * nodes.length);

      n[v.__x] = 0 + v.offset[0] + shiftX * i;
      n[v.__y] = 0 + v.offset[1] + shiftY * i * 2;

      n[v.__width] = v.size[0] - shiftX * i * 2;
      n[v.__height] = v.size[1] - shiftY * i * 2;

      n[v.__cx] = n[v.__x] + n[v.__width] / 2;
      n[v.__cy] = n[v.__y] + shiftY;

    } else if(v.orient == "top") {

      shiftX = v.size[0] / (2 * nodes.length);
      shiftY = v.size[1] / (2 * nodes.length);

      n[v.__x] = 0 + v.offset[0] + shiftX * i;
      n[v.__y] = 0 + v.offset[1];

      n[v.__width] = v.size[0] - shiftX * i * 2;
      n[v.__height] = v.size[1] - shiftY * i * 2;

      n[v.__cx] = n[v.__x] + n[v.__width] / 2;
      n[v.__cy] = n[v.__y] + shiftY * i * 2 + shiftY;

    } else { // central default

      shiftX = v.size[0] / (2 * nodes.length);
      shiftY = v.size[1] / (2 * nodes.length);

      n[v.__x] = 0 + v.offset[0] + shiftX * i;
      n[v.__y] = 0 + v.offset[1] + shiftY * i;

      n[v.__width] = v.size[0] - shiftX * i * 2;
      n[v.__height] = v.size[1] - shiftY * i * 2;

      n[v.__cx] = n[v.__x] + n[v.__width] / 2;
      n[v.__cy] = n[v.__y] + n[v.__height] / 2;

      if(v.rotate !==null) {
        n["__p"] = [];
        n["__p"].push(rotate(n[v.__cx], n[v.__cy], n[v.__x], n[v.__y], v.rotate));
        n["__p"].push(rotate(n[v.__cx], n[v.__cy], n[v.__x] + n[v.__width], n[v.__y], v.rotate));
        n["__p"].push(rotate(n[v.__cx], n[v.__cy], n[v.__x] + n[v.__width], n[v.__y] + n[v.__height], v.rotate));
        n["__p"].push(rotate(n[v.__cx], n[v.__cy], n[v.__x], n[v.__y] + n[v.__height], v.rotate));
        n["__p"].push(rotate(n[v.__cx], n[v.__cy], n[v.__x], n[v.__y], v.rotate));
      }

    }
  });

  return nodes;
};

var radial = function(nodes, v) {

  if(!v.radius) {
    v.radius = Math.min(v.size[0], v.size[1]) - 2 * (v.size[1] / nodes.length);
  }

  var arc$$1 = d3Shape.arc()
      .outerRadius(v.radius)
      .innerRadius(0);

  var pie$$1 = d3Shape.pie()
      .sort(v.sort)
      .value(function() { return 1; });

  var arcs = pie$$1(nodes);

  nodes.forEach(function(n, i) {

    n[v.__width] = v.size[0] / nodes.length;
    n[v.__height] = v.size[1] / nodes.length;

    // Must be after width & height
    n[v.__x] = arc$$1.centroid(arcs[i])[0] + v.size[0] / 2 + v.offset[0] - n[v.__width] / 2 + v.padding;
    n[v.__y] = arc$$1.centroid(arcs[i])[1] + v.size[1] / 2 + v.offset[1] - n[v.__height] / 2 + v.padding;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var stack$1 = function(nodes, v) {

  if(v.sort) {
    nodes = nodes.sort(v.sort);
  }

  var stack$$1 = d3Shape.stack()
      .keys(nodes.map(function(d, i) { return i + "_"; })) // Creates unique ids for nodes
      .order(d3Shape.stackOrderDescending)
      .value(function(d, key) { return nodes.indexOf(d[key]); });

  v.y.domain([0, d3Array.sum(d3Array.range(nodes.length)) + nodes.length]).range([0, v.size[1]]);

  var new_data = {};

  nodes.map(function(d, i) {
    new_data[i+"_"] = d;
  });

  var stacked = stack$$1([new_data]);

  nodes.forEach(function(n, i) {
    var s = stacked[i][0];

    n[v.__x] = v.offset[0] + v.padding;
    n[v.__y] = v.y(s[1]) + v.offset[1] + v.padding;

    n[v.__width] = v.size[0];
    n[v.__height] = v.y(s[1]) - v.y(s[0]);

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var step = function(nodes, v) {

  var _shiftX = v.size[0] / (2 * nodes.length);

  nodes.forEach(function(n, i) {

    n[v.__x] = 0 + v.offset[0] + _shiftX * i  + v.padding;
    n[v.__y] = 0 + v.offset[1] + v.padding;

    n[v.__width] = v.size[0] - _shiftX * i * 2;
    n[v.__height] = v.size[1];

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;
  });

  return nodes;
};

var tree$1 = function(nodes, v) {

  var treeData = d3Hierarchy.stratify()
      .id(v.id)
      .parentId(v.parentId)(nodes);

  var tree$$1 = d3Hierarchy.tree()
      .size([v.size[0], v.size[1] / 2]);

  var treeLayout = d3Hierarchy.hierarchy(treeData, function(d) {
      return d.children;
    });

  treeLayout = tree$$1(treeLayout);

  nodes.forEach(function(n, i) {

    n[v.__width] = v.cellSize ? v.cellSize[0]: v.size[0] / nodes.length;
    n[v.__height] = v.cellSize ? v.cellSize[1]: v.size[1] / nodes.length;

    n[v.__x] = treeLayout.descendants()[i].x + v.offset[0] - n[v.__width] / 2;
    n[v.__y] = treeLayout.descendants()[i].y + v.offset[1];

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;

  });

  return nodes;
};

var treemap$1 = function(nodes, v) {

  var treemap$$1 = d3Hierarchy.treemap()
      .size([v.size[0] - 2 * v.margin, v.size[1] - 2 * v.margin])
      .padding(v.padding);

  var stratify$$1 = d3Hierarchy.stratify()
      .parentId(function(d) { return d.___parent_id; });

  nodes.forEach(function(d, i) {
    d.id = "_" + i;
    d.___parent_id = "_x";
  });

  var extra = [{"id": "_x", "___parent_id": ""}];

  var root = stratify$$1(nodes.concat(extra))
      .sum(function(d) { return d.___parent_id === "" ? 0: 1; });

  if(v.valueHeight) {
    root.sum(function(d) { return v.valueHeight(d); });
  }

  if(v.sort) {
    if(v.sortAsc) {
      root.sort(function(a, b) { return a.value - b.value; });
    } else {
      root.sort(function(a, b) { return b.value - a.value; });
    }
  }

  var tree$$1 = treemap$$1(root);

  tree$$1.leaves().forEach(function(t, i) {
    t.data[v.__x] = t.x0 + v.offset[0] + v.margin;
    t.data[v.__y] = t.y0 + v.offset[1] + v.margin;

    t.data[v.__width] = t.x1 - t.x0;
    t.data[v.__height] = t.y1 - t.y0;

    t.data[v.__cx] = nodes[i][v.__x] + nodes[i][v.__width] / 2;
    t.data[v.__cy] = nodes[i][v.__y] + nodes[i][v.__height] / 2;
  });

  return nodes;
};

var vertical = function(nodes, v) {

  if(v.sort) {
    nodes = nodes.sort(v.sort);
  }

  var _valueWidth;

  if(!v.valueWidth) {
    _valueWidth = function() { return 1; };
    v.width.domain([0, nodes.length]).range([0, v.size[0] - 2 * v.padding]);
  } else {
    _valueWidth = v.valueWidth;
    v.width.domain([0, d3Array.sum(nodes, _valueWidth)]).range([0, v.size[0] - 2 * v.padding]);
  }

  var _valueHeight;

  if(!v.valueHeight) {
    _valueHeight = function() { return 1; };
    v.height.domain([0, 1]).range([0, v.size[1] - 2 * v.padding]);
  } else {
    _valueHeight = v.valueHeight;
    v.height.domain([0, d3Array.max(nodes, _valueHeight)]).range([0, v.size[1] - 2 * v.padding]);
  }

  if(nodes.length > 0) {
    nodes[0].x0 = v.padding;
  }

  nodes.forEach(function(n, i) {

    n[v.__x] = n.x0 + v.offset[0] + v.margin;

    if(v.orient === "down") {
      n[v.__y] = 0 + v.offset[1] + v.margin + v.padding;
    } else if(v.orient === "up") {
      n[v.__y] = v.size[1] - v.height(_valueHeight(n)) + v.offset[1] + v.margin - v.padding;
    } else if(v.orient === "center") {
      n[v.__y] = (v.size[1] / 2) - v.height(_valueHeight(n)) / 2 + v.offset[1] + v.margin - v.padding;
    } else { // defaut down
      n[v.__y] = 0 + v.offset[1] + v.margin + v.padding;
    }

    n[v.__height] = v.height(_valueHeight(n)) - 2 * v.margin;
    n[v.__width] = v.width(_valueWidth(n));

    // Updates the next node's y0 for all nodes but the last one
    if(i < nodes.length - 1) {
      nodes[i+1].x0 = n.x0 + n[v.__width];
    }

    n[v.__width] -= 2 * v.margin;

    n[v.__cx] = n[v.__x] + n[v.__width] / 2;
    n[v.__cy] = n[v.__y] + n[v.__height] / 2;

    if(v.rotate !==null) {
      n["__p"] = [];
      n["__p"].push(rotate(v.size[0] / 2, v.size[1] / 2, n[v.__x], n[v.__y], v.rotate));
      n["__p"].push(rotate(v.size[0] / 2, v.size[1] / 2, n[v.__x] + n[v.__width], n[v.__y], v.rotate));
      n["__p"].push(rotate(v.size[0] / 2, v.size[1] / 2, n[v.__x] + n[v.__width], n[v.__y] + n[v.__height], v.rotate));
      n["__p"].push(rotate(v.size[0] / 2, v.size[1] / 2, n[v.__x], n[v.__y] + n[v.__height], v.rotate));
      n["__p"].push(rotate(v.size[0] / 2, v.size[1] / 2, n[v.__x], n[v.__y], v.rotate));
    }

  });

  return nodes;
};

var gridding = function() {

  var vars = {
    __prefix: "",
    __x: "",
    __y: "",
    __width: "",
    __height: "",
    __cx: "",
    __cy: "",
    __r: "",
    cellSize: null,
    cols: null,
    height: d3Scale.scaleLinear(),
    id: function(d, i) { return i; },
    layout: identity,
    margin: 0,
    mode: "identity",
    modes: {
      "brick": {
        "layout": brick,
        "properties": [
          {"key": "orient", "value": "left"},
          {"key": "orient", "value": "right", "default": true},
          {"key": "orient", "value": "top"},
          {"key": "orient", "value": "bottom"}
        ]
      },
      "cascade": {
        "layout": cascade,
        "properties": [
        ]
      },
      "central": {
        "layout": central,
        "properties": [
        ]
      },
      "coordinate": {
        "layout": coordinate,
        "properties": [
          {"key": "valueX", "value": null},
          {"key": "valueY", "value": null}
        ]
      },
      "corner": {
        "layout": corner,
        "properties": [
          {"key": "orient", "value": "top right"}
        ]
      },
      "diagonal": {
        "layout": diagonal,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "grid": {
        "layout": grid,
        "properties": [
          {"key": "orient", "value": "up"},
          {"key": "orient", "value": "down", "default": true},
          {"key": "orient", "value": "left"},
          {"key": "orient", "value": "right"}
        ]
      },
      "horizontal": {
        "layout": horizontal,
        "properties": [
          {"key": "orient", "value": "top"},
          {"key": "orient", "value": "left"},
          {"key": "orient", "value": "right"},
          {"key": "orient", "value": "center"},
          {"key": "valueY", "value": null},
          {"key": "valueWidth", "value": null}
        ]
      },
      "pack": {
        "layout": pack$1,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "pyramid": {
        "layout": pyramid,
        "properties": [
          {"key": "orient", "value": "center", "default": true},
          {"key": "orient", "value": "top"},
          {"key": "orient", "value": "bottom"}
        ]
      },
      "radial": {
        "layout": radial,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "stack": {
        "layout": stack$1,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "step": {
        "layout": step,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "tree": {
        "layout": tree$1,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "treemap": {
        "layout": treemap$1,
        "properties": [
          {"key": "orient", "value": "top"}
        ]
      },
      "vertical": {
        "layout": vertical,
        "properties": [
          {"key": "orient", "value": "top"},
          {"key": "orient", "value": "left"},
          {"key": "orient", "value": "right"},
          {"key": "orient", "value": "center"},
          {"key": "valueHeight", "value": null}
        ]
      }
    },
    offset: [0, 0],
    orient: "down",
    parentId: function(d, i) { return i === 0 ? null: 0; },
    padding: 0,
    radius: null,
    rotate: null,
    rows: null,
    shiftX: null,
    shiftY: null,
    size: [1, 1],
    sort: null,
    sortAsc: true,
    value: function(d) { return d; },
    valueHeight: null,
    valueWidth: null,
    valueX: null,
    valueY: null,
    width: d3Scale.scaleLinear(),
    x: d3Scale.scaleLinear(),
    y: d3Scale.scaleLinear()
  };

  function gridding(nodes) {

    // In case a prefix has been set
    vars.__x = vars.__prefix + "x";
    vars.__y = vars.__prefix + "y";
    vars.__width = vars.__prefix + "width";
    vars.__height = vars.__prefix + "height";
    vars.__cx = vars.__prefix + "cx";
    vars.__cy = vars.__prefix + "cy";
    vars.__r = vars.__prefix + "r";

    if(typeof nodes === "undefined" || nodes === "" || nodes === null) {

      nodes = [];

    } if(typeof vars.value(nodes) === "undefined" || vars.value(nodes) === "" || vars.value(nodes) === null) {

      nodes = [];

    } else if(typeof vars.value(nodes)[0] !== "object") {

      nodes = Array.prototype.map.call(nodes, function(d, i) {
        return {"__value": d, "__index": i};
      });

    } else {

      nodes = vars.value(nodes);
    }

    nodes.forEach(function(n) {
      n[vars.__r] = 0;
    });

    return vars.layout(nodes, vars);
  }

  gridding.mode = function(_mode) {
    if (!arguments.length) return vars.mode;
    vars.mode = _mode;
    if(vars.mode === "identity") {
      vars.layout = identity;
    } else if(Object.keys(vars.modes).indexOf(_mode) >= 0) {
      vars.layout = vars.modes[vars.mode].layout;
    }
    return gridding;
  };

  gridding.modes = function(_mode) {
    if(arguments.length === 1) return vars.modes[_mode].properties;
    return Object.keys(vars.modes);
  };

  gridding.size = function(_size) {
    if(!arguments.length) return vars.size;
    vars.size = _size;
    return gridding;
  };

  gridding.cellSize = function(_cellSize) {
    if(!arguments.length) return vars.cellSize;
    vars.cellSize = _cellSize;
    return gridding;
  };

  gridding.value = function(_value) {
    if(!arguments.length) return vars.value;
    vars.value = _value;
    return gridding;
  };

  gridding.valueX = function(_valueX) {
    if(!arguments.length) return vars.valueX;
    if(typeof _valueX === "string") {
      vars.valueX = function(d) { return d[_valueX]; };
    } else {
      vars.valueX = _valueX;
    }
    return gridding;
  };

  gridding.valueY = function(_valueY) {
    if(!arguments.length) return vars.valueY;
    if(typeof _valueY === "string") {
      vars.valueY = function(d) { return d[_valueY]; };
    } else {
      vars.valueY = _valueY;
    }
    return gridding;
  };

  gridding.valueHeight = function(_valueHeight) {
    if(!arguments.length) return vars.valueHeight;
    if(typeof _valueHeight === "string") {
      vars.valueHeight = function(d) { return d[_valueHeight]; };
    } else {
      vars.valueHeight = _valueHeight;
    }
    return gridding;
  };

  gridding.valueWidth = function(_valueWidth) {
    if(!arguments.length) return vars.valueWidth;
    if(typeof _valueWidth === "string") {
      vars.valueWidth = function(d) { return d[_valueWidth]; };
    } else {
      vars.valueWidth = _valueWidth;
    }
    return gridding;
  };

  gridding.sort = function(_sort) {
    if(!arguments.length) return vars.sort;
    if(typeof _sort === "string") {
      vars.sort = function(d) { return d[_sort]; };
    } else {
      vars.sort = _sort;
    }
    return gridding;
  };

  gridding.sortAsc = function(_sortAsc) {
    if(!arguments.length) return vars.sortAsc;
    vars.sortAsc = _sortAsc;
    return gridding;
  };

  gridding.padding = function(_padding) {
    if(!arguments.length) return vars.padding;
    vars.padding = _padding;
    return gridding;
  };

  gridding.margin = function(_margin) {
    if(!arguments.length) return vars.margin;
    vars.margin = _margin;
    return gridding;
  };

  gridding.offset = function(_offset) {
    if(!arguments.length) return vars.offset;
    vars.offset = _offset;
    return gridding;
  };

  gridding.orient = function(_orient) {
    if(!arguments.length) return vars.orient;
    vars.orient = _orient;
    return gridding;
  };

  gridding.cols = function(_cols) {
    if(!arguments.length) return vars.cols;
    vars.cols = _cols;
    return gridding;
  };

  gridding.rows = function(_rows) {
    if(!arguments.length) return vars.rows;
    vars.rows = _rows;
    return gridding;
  };

  gridding.radius = function(_radius) {
    if(!arguments.length) return vars.radius;
    vars.radius = _radius;
    return gridding;
  };

  gridding.rotate = function(_rotate) {
    if(!arguments.length) return vars.rotate;
    vars.rotate = _rotate;
    return gridding;
  };

  gridding.prefix = function(_prefix) {
    if(!arguments.length) return vars.__prefix;
    vars.__prefix = _prefix;
    return gridding;
  };

  gridding.id = function(_id) {
    if(!arguments.length) return vars.id;
    vars.id = _id;
    return gridding;
  };

  gridding.params = function(_params) {
    if(!arguments.length) return vars;
    for(var key in _params) {
      if (_params.hasOwnProperty(key)) {
        if(key === "mode") {
          gridding.mode(_params[key]);
        } else {
          vars[key] = _params[key];
        }
      }
    }
    return gridding;
  };

  gridding.parentId = function(_parentId) {
    if(!arguments.length) return vars.parentId;
    vars.parentId = _parentId;
    return gridding;
  };

  gridding.shiftX = function(_shiftX) {
    if(!arguments.length) return vars.shiftX;
    vars.shiftX = _shiftX;
    return gridding;
  };

  gridding.shiftY = function(_shiftY) {
    if(!arguments.length) return vars.shiftY;
    vars.shiftY = _shiftY;
    return gridding;
  };

  return gridding;
};

exports.gridding = gridding;

Object.defineProperty(exports, '__esModule', { value: true });

})));

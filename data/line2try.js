let fs = require('fs');
let d3 = require('d3');
let d3s = require('d3-shape');
let rough = require('roughjs');
let d3Gridding = require('d3-gridding');
let Canvas = require('canvas')
let xml = require('xmlserializer')
let JSDOM = require('jsdom').JSDOM;
let output_dir = "output/";
let last;
let width = 500,
    height = 500;


var x = d3.scaleLinear()
    .rangeRound([50, 500]).domain([0, 9]);

var y = d3.scaleLinear()
    .rangeRound([450, 0]).domain([0, 500]);

var line = d3.line()
    .x(function (d, i) {
        return x(i);
    })
    .y(function (d) {
        return y(d.height);
    })
    .curve(d3.curveCardinal)

let colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];


let color = d3.scaleOrdinal().range(colors);

let modes = ["horizontal", "vertical"];
let orients = ["up", "down", "left", 'right'];
let distributions = ["random", "d3.randomBates"];
// based on
// https://gist.github.com/tomgp/c99a699587b5c5465228
module.exports = function (pieData, outputLocation) {

    if (!outputLocation) outputLocation = 'grid.svg';
    const window = (new JSDOM(`<html><head><script src="//roughjs.com/builds/rough.min.js"></script></head><body><canvas id="conv"></canvas></body></html>`, {pretendToBeVisual: true})).window;
    var htmlToImage = require('html-to-image');
    window.d3 = d3.select(window.document);

    document = (window.document);

    var svg = window.d3.select('body')
        .append('div').attr('class', 'container') //make a container div to ease the saving process
        .append('svg')
        .attr('id', 'svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'svg')
    //.append('g');

    // main grid parameters


    const sv = window.document.getElementById('svg');
    const rc = rough.svg(sv);

    let gridding = d3Gridding.gridding()
        .size([450, 450])
        .valueHeight("__value")
        .orient("up")
        .mode("vertical");


    // s: size of the dataset
    // d: type of distribution (default random)
    // p: parameter (if available for the distribution)
    function generate_data(s, d = "random", p) {
        let data = [];

        if (d === "d3.randomBates") {
            data = d3.range(20).map(d3.randomBates(Math.floor(Math.random() * Math.floor(20)) + 0.3));
        } else if (d === "d3.randomExponential") {
            data = d3.range(20).map(d3.randomExponential(Math.floor(Math.random() * Math.floor(10)) + 0.3));
        } else if (d === "linear") {
            data = [];
            d3.range(1000).map(function (d) {
                d3.range(d).map(function (e) {
                    data.push(d);
                })
            });
        } else if (d === "random") { // default random
            data = d3.range(1000).map(Math.random);
        }

        let x = d3.scaleLinear()
            .rangeRound([0, width]);

        let bins = d3.histogram()
            .domain(x.domain())
            //.thresholds(x.ticks(s))
            .thresholds(d3.range(0, 1, 1 / s))
            (data);


        return bins.map(function (d) {
                return d.length;
            }
        )
            ;
    }


    d3.range(20).map(function (d, i) {

        let offx = Math.floor(Math.random() * Math.floor(200));
        let offy = Math.floor(Math.random() * Math.floor(200));

        let data = generate_data(Math.floor(Math.random() * Math.floor(6)) + 4, distributions[Math.floor(Math.random() * distributions.length)], Math.floor(Math.random() * Math.floor(20)) + 0.3);
        let t = orients[Math.floor(Math.random() * orients.length)];

        setTimeout(function (d) {

            // cleaning up the DOM
            window.d3.selectAll("path").remove();

            // update the grid library with new data

            let m = 'vertical';

            if (m !== 'horizontal') {
                gridding = d3Gridding.gridding()
                    .size([450, 450])
                    .valueHeight("__value")
                    .orient('up')
                    .mode(m);
            } else {
                gridding = d3Gridding.gridding()
                    .size([450, 450])
                    .valueWidth("__value")
                    .orient(orients[Math.floor(Math.random() * orients.length)])
                    .mode(m);
            }


            let griddingData = gridding(data);


            console.log("writing image #", i);

            let nb = Math.floor(Math.random() * 90)


            griddingData.forEach(function (d, i) {

                //hand drawn like style
                sv.appendChild(rc.rectangle(d.x + 30, d.y + 30, d.width, d.height, {roughness: temprng(0, 0.6), strokeWidth: 3}));
            })


            fs.writeFileSync(__dirname + '/' + output_dir + "fill_color" + i + ".jpg", svgToCanvas(svg, window));


            //fs.writeFileSync(__dirname + '/' + output_dir + "fill_color" + i + ".svg", window.d3.select('.container').html());


            window.d3.selectAll("path").remove();


            let t = get_rng();


            // Draw the line chart
            svg.append("path")
                .datum(griddingData)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 5)
                .attr("d", line);


            //save it
            fs.writeFileSync(__dirname + '/' + output_dir + "fill" + i + ".svg", window.d3.select('.container').html())
        }, 500);
    });
};

if (require.main === module) {
    module.exports();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_rng() {
    let rng = getRandomInt(0, colors.length - 1);
    while (last === rng) {
        rng = getRandomInt(0, colors.length - 1)
    }
    last = rng;
    return rng;
}


function temprng(a, b) {

    return a + (b - a) * (1 - Math.sqrt(Math.random() * Math.floor(1)))
}


function svgToCanvas(svg, window) {
    // Select the first svg element

    console.log('dasdasdsa');
    img = new Canvas.Image(),
        serializer = xml
    //svgStr = serializer.serializeToString();

    img.src = 'data:image/svg+xml;base64,' + window.btoa(svg.node());
    console.log(svg);
    img.onload = function () {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        console.log(img.src+'---');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        // Now save as png or whatever
        return '<img src="' + canvas.toDataURL("image/jpg") + '">';
    }


    // You could also use the actual string without base64 encoding it:
    //img.src = "data:image/svg+xml;utf8," + svgStr;


};
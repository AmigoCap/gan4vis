let fs = require('fs');
let d3 = require('d3');
let rough = require('roughjs');
let d3Gridding = require('d3-gridding');
let JSDOM = require('jsdom').JSDOM;
let output_dir = "output/";
let last;
let width = 500,
    height = 500;

let y = d3.scaleLinear()
    .rangeRound([0, width]);


let colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];


let color = d3.scaleOrdinal().range(colors);

let modes = ["horizontal", "vertical"];
let orients = ["up", "down", "left", 'right'];
let distributions = ["random", "d3.randomBates", "d3.randomExponential"];
// based on
// https://gist.github.com/tomgp/c99a699587b5c5465228
module.exports = function (pieData, outputLocation) {

    if (!outputLocation) outputLocation = 'grid.svg';
    const window = (new JSDOM(`<html><head><script src="//roughjs.com/builds/rough.min.js"></script></head><body></body></html>`, {pretendToBeVisual: true})).window;

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
        .append('g');


    // main grid parameters


    const sv = window.document.getElementById('svg');
    const rc = rough.svg(sv);

    let gridding;


    // s: size of the dataset
    // d: type of distribution (default random)
    // p: parameter (if available for the distribution)
    function generate_data(s, d = "random", p) {
        let data = [];

        if (d === "d3.randomBates") {
            data = d3.range(1000).map(d3.randomBates(Math.floor(Math.random() * Math.floor(20)) + 0.3));
        } else if (d === "d3.randomExponential") {
            data = d3.range(1000).map(d3.randomExponential(Math.floor(Math.random() * Math.floor(20)) + 0.3));
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
        });
    }

    d3.range(10).map(function (d, i) {
        
     /*  let offx =Math.floor(Math.random() * Math.floor(60))+20 ;
       let offy =Math.floor(Math.random() * Math.floor(60))+20 ;

        if(Boolean(Math.floor(Math.random() * 2))) {

offx = offx *-1
offy = offy *-1
            }
*/

        let data = generate_data(Math.floor(Math.random() * Math.floor(8)) + 9, distributions[Math.floor(Math.random() * distributions.length)], Math.floor(Math.random() * Math.floor(20)) + 0.3);
        let t = orients[Math.floor(Math.random() * orients.length)];

        setTimeout(function (d) {

            // cleaning up the DOM
            window.d3.selectAll("path").remove();
            window.d3.selectAll(".square").remove();
            window.d3.selectAll(".index").remove();

        
            //   var data = d3.range(1000).map(d3.randomBates(Math.floor(Math.random() * Math.floor(20)) + 0.3));


            // update the grid library with new data

            let m =  'vertical';

            if (m !== 'horizontal') {
                gridding = d3Gridding.gridding()
                    .size([width, height])
                    .valueHeight("__value")
                    .orient('up')
                    .mode(m);
            } else {
                gridding = d3Gridding.gridding()
                  .size([width, height])
                    .valueWidth("__value")
                    .orient(orients[Math.floor(Math.random() * orients.length)])
                    .mode(m);
            }

            let griddingData = gridding(data);


            console.log("writing image #", i);


            griddingData.forEach(function (d) {
                sv.appendChild(rc.rectangle(d.x, d.y, d.width, d.height, {roughness: temprng(0, 4),strokeWidth: temprng(1, 4)}));
            });

            //sv.appendChild(rc.rectangle(getRandomInt(0, 400),getRandomInt(0, 400), getRandomInt(80, 450), getRandomInt(80, 450), {roughness: 0, fill: 'rgba(255,0,200,1)', fillStyle: 'solid',strokeWidth: 0}));


            // write out the children of the container div
            fs.writeFileSync(__dirname + '/' + output_dir + "purg" + i + ".svg", window.d3.select('.container').html());

            window.d3.selectAll("path").remove();
            svg.selectAll(".index").remove();
            svg.selectAll(".mask").remove();
            let t = get_rng();
            svg.selectAll(".square")
                .data(griddingData)
                .enter().append("rect")
                .style("fill", function (d, i) {
                    return color(i)
                })
                .style("stroke", "black")
                .attr("stroke-width", 1.8)
                .attr("class", "square")
                .attr("width", function (d) {
                    return d.width;
                })
                .attr("height", function (d) {
                    return d.height;
                })
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            fs.writeFileSync(__dirname + '/' + output_dir + "purg_label" + i + ".svg", window.d3.select('.container').html())
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

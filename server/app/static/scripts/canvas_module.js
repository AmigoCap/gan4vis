var canvasDiv = document.getElementById('canvasDivId');
var ajax_binary_image;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

canvas = document.createElement('canvas');
canvas.setAttribute('width', 256);
canvas.setAttribute('height', 256);
canvas.setAttribute('id', 'canvasId');
canvasDiv.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
	canvas = G_vmlCanvasManager.initElement(canvas);
}
context = canvas.getContext("2d");

$("#canvasId").mousedown(function(e){
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	paint = true;
	addClick(mouseX, mouseY);
	redraw();
})

$("#canvasId").mousemove(function(e){
	if(paint){
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
		redraw();
	}
});

$("#canvasId").mouseup(function(e){
	paint = false;
});

$("#canvasId").mouseleave(function(e){
	paint = false;
});

function addClick(x, y, dragging)
{
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
}

function redraw()
{
	// Clears the canvas
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	context.strokeStyle = "black";
	context.lineJoin = "round";
	context.lineCap = "round";
	context.lineWidth = 1;

	for(var i=0; i< clickX.length; i++){
		context.beginPath();
		if(clickDrag[i] && i){
			context.moveTo(clickX[i-1], clickY[i-1]);
		} else {
			context.moveTo(clickX[i] - 1, clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		context.stroke();
	}
}

$("#create_transition_button").on("touchstart click",function() {
  ajax_binary_image = canvas.toDataURL("image/png")
  $.ajax({
    url: "/treatment_transitions",
    type: "POST",
    data: JSON.stringify({
      "image": ajax_binary_image, // Send the binary of the drawn sketch
    }),
    contentType: "application/json; charset=utf-8",
    beforeSend: function() {
      document.getElementById("download_button").style.visibility = "hidden" //hidden the download option
      document.getElementById("spinning_wheel").style.visibility = "visible";
    },
    success: function(response) {
      document.getElementById("spinning_wheel").style.visibility = "hidden";
      document.getElementById("download_button").style.visibility = "visible" //show the download option
      $("#result_image").attr("src", "static/output_images/" + response + ".gif") //Update the result image
      document.getElementById('download_link').setAttribute("href","static/output_images/" + response + ".jpg") //Update the download target
      history.pushState(window.location.href, "index", "?token=" + response)
    }
  })
});

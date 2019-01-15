var canvasDiv = document.getElementById('canvasDivId');

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

function save_sketch()
{

	form_canvas = document.getElementById("hiddenCanvasContentId");
	form_canvas.value = canvas.toDataURL("image/png");
}

submit_button = document.getElementById("saveSketchButtonId");
submit_button.onclick = save_sketch;

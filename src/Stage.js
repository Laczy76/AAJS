/*
*
* Copyright (c) 2015- Ladislav Vegh, Komarno, Slovakia
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*
*/

var inalan = inalan || {};

inalan.Stage = function (canvasId) {
	this.canvas = document.getElementById("myCanvas")
	this.ctx = this.canvas.getContext("2d");
	this.visuData = {};
}

inalan.Stage.prototype.render = function () {
	// clear the stage
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// render all objects in visuData
	for (var index in this.visuData) {
		if (this.visuData.hasOwnProperty(index)) {
			this.visuData[index].render();
		}
	}	
}

inalan.Stage.prototype.add = function (visuData) {
	if (typeof(this.visuData[visuData.name]) != 'undefined') {
		throw "- Can not add '" + visuData.name + "' to the stage, object with this name already exists on the stage.";
	}
	visuData.ctx = this.ctx;
	this.visuData[visuData.name] = visuData;
}


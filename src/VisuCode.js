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

inalan.VisuCode = function (lines) {
    // create subclass VisuCode from VisuData - set properties
    inalan.VisuData.call(this);
    // set new properties
    this.lines = lines;
    this.selected = [];
    // background color of selected lines
    this.selectionColor = "#DEE";
}

// create subclass VisuCode from VisuData - set methods
inalan.VisuCode.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuCode.prototype.constructor = inalan.VisuCode;

inalan.VisuCode.prototype.render = function () {    
    // determine the longest line in source code
    this.ctx.font = "bold 16px Courier New"
    var maxWidth = 0;
    for (var i = 0; i < this.lines.length; i++) {
        if (this.ctx.measureText(this.lines[i]).width > maxWidth) {
            maxWidth = this.ctx.measureText(this.lines[i]).width;
        }
    }
    // draw selected rectangles
    this.ctx.fillStyle = this.selectionColor;
    for (var i in this.selected) {
        this.ctx.fillRect(this.x, this.y + this.selected[i] * 22, maxWidth + 40, 20);
    }
    // draw the VisuCode    
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    for (var i = 0; i < this.lines.length; i++) {
        this.ctx.fillText(this.lines[i], this.x + 20, this.y + 1 + i * 22);
    }
}

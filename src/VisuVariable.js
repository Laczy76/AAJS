/// <reference path="VisuData.js" />

/*
*
* Copyright (c) 2015- Ladislav Végh, Komárno, Slovakia
*
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*
*/

var inalan = inalan || {};

inalan.VisuVariable = function (name, value) {
    // create subclass VisuVariable from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties
    if (value < 0) {
        throw "- the value of '" + name + "' must be >= 0";
    }
    // properties for visualization
    this.value = value; // value (red column)
    this.minValue = 0; // minimum value when dragging with the mouse and trying to change it's value
    this.maxValue = value > 150 ? value : 150; // maximum value when dragging with the mouse and trying to change it's value
    this.color = "#C00"; // default color (red)
    this.width = 20; // width of the column
    this.height = this.maxValue; // height of the column (gray)
    this.textRotation = 0;
    this.changable = true; // can be changed by mouse dragging
}

// create subclass VisuVariable from VisuData - set methods
inalan.VisuVariable.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuVariable.prototype.constructor = inalan.VisuVariable;

inalan.VisuVariable.prototype.render = function () {
    // call superclass's render function
    inalan.VisuData.prototype.render.call(this);
    // draw VisuVariable
    this.ctx.fillStyle = "#EEE";
    this.ctx.fillRect(this.x, this.y, this.width + 1, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y + (this.height - this.value), this.width, this.value);
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - 2, this.y + 0.5 + this.height);
    this.ctx.lineTo(this.x + 23, this.y + 0.5 + this.height);
    this.ctx.stroke();
    this.ctx.strokeRect(this.x + 0.5, this.y + 0.5 + (this.height - this.value), this.width, this.value);
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    if (this.textRotation == 0) {
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height + 14);
    } else {
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height + 14);
        this.ctx.rotate( - Math.PI / 180 * this.textRotation);
        this.ctx.textAlign = "right";
        this.ctx.fillText(this.name, 8, 4);
        this.ctx.restore();
    }
    if (this.changable) {

    }
}


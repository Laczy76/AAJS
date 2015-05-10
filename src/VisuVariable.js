/// <reference path="VisuData.js" />

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

inalan.VisuVariable = function (name, value, changable) {
    if (typeof (changable) == "undefined") {
        changable = false;
    }
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
    this.changable = changable; // can be changed by mouse dragging
    this.dragging = false; // dragging (changing the value) with mouse
}

// create subclass VisuVariable from VisuData - set methods
inalan.VisuVariable.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuVariable.prototype.constructor = inalan.VisuVariable;

// render the visuvariable (draw the column)
inalan.VisuVariable.prototype.render = function (renderText) {
    // renderText:
    //   Do write the text under the culomn (renderText==true)?
    //   Or only draw the column (rednerText==false or undefined)?
    if (typeof (renderText) == 'undefined') {
        renderText = true;
    }
    // check if value is between minValue and maxValue
    if (this.value > this.maxValue) {
        this.value = this.maxValue;
    } else if (this.value < this.minValue) {
        this.value = this.minValue;
    }
    // call superclass's render function
    inalan.VisuData.prototype.render.call(this);
    // draw VisuVariable
    this.ctx.fillStyle = "#EEE";
    this.ctx.fillRect(this.x - this.width/2 - 1, this.y - this.height - 0.5, this.width + 1, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x - this.width/2 - 0.5, this.y - this.value - 0.5, this.width, this.value);
    this.ctx.strokeStyle = '#000';
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - this.width / 2 - 3, this.y - 0.5);
    this.ctx.lineTo(this.x - this.width / 2 + this.width + 2, this.y - 0.5);
    this.ctx.stroke();
    this.ctx.strokeRect(this.x - this.width / 2 - 0.5, this.y - 0.5 - this.value, this.width, this.value);
    this.ctx.fillStyle = "#000";
    if (renderText) {
        this.ctx.font = "12px Arial";
        if (this.textRotation == 0) {
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.name, this.x - 0.5, this.y + 13.5);
        } else {
            this.ctx.save();
            this.ctx.translate(this.x - 0.5, this.y + 13.5);
            this.ctx.rotate(-Math.PI / 180 * this.textRotation);
            this.ctx.textAlign = "right";
            this.ctx.fillText(this.name, 7, 3);
            this.ctx.restore();
        }
    }
}

// is the X, Y (e.g. mouse position) over the variable (in the upper part for changing the value) ?
inalan.VisuVariable.prototype.isOver = function (x,y) {
    if (Math.abs(x - this.x) <= this.width / 2 && Math.abs(y - (this.y - this.value)) <= 5) {
            return true;
    }
    return false
}

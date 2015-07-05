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
    this.maxValue = value > 180 ? value : 180; // maximum value when dragging with the mouse and trying to change it's value
    this.fillColor = "#C00"; // default color (red)
    this.strokeColor = "#000";
    this.width = 24; // width of the column    
    this.textRotation = 0;
    this.changable = changable; // can be changed by mouse dragging
    this.dragging = false; // dragging (changing the value) with mouse
    this.copy = false; // copiing or moving the variable (if true, it draws a rectangle to copyx, copyy coordinates)
    this.copyx = 0;
    this.copyy = 0;
    // color constants
    this.defaultColor = "#C00";
    this.compareColor = "#FFD";
    this.copyColor = "#FF0";
    this.grayColor = "#CCC";
    this.hiddenColor = "#EEE";
}

// create subclass VisuVariable from VisuData - set methods
inalan.VisuVariable.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuVariable.prototype.constructor = inalan.VisuVariable;

// set random value to VisuVariable
inalan.VisuVariable.prototype.randomize = function (min, max) {
    if (typeof (min) == 'undefined' || min < this.minValue) {
        min = this.minValue;
    }
    if (typeof (max) == 'undefined' || max > this.maxValue) {
        max = this.maxValue;
    }
    this.value = Math.floor((Math.random() * (max - min + 1)) + min);
}

// render the visuvariable (draw the column)
inalan.VisuVariable.prototype.render = function () {
    // check if value is between minValue and maxValue
    if (this.value > this.maxValue) {
        this.value = this.maxValue;
    } else if (this.value < this.minValue) {
        this.value = this.minValue;
    }
    // draw VisuVariable
    this.ctx.fillStyle = this.hiddenColor; // backround
    this.ctx.fillRect(this.x - this.width / 2 - 1, this.y - this.maxValue - 1, this.width + 1, this.maxValue);
    this.ctx.fillStyle = this.fillColor; // column
    this.ctx.fillRect(this.x - this.width / 2 - 0.5, this.y - this.value - 0.5, this.width, this.value);
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.strokeRect(this.x - this.width / 2 - 0.5, this.y - 0.5 - this.value, this.width, this.value);
    this.ctx.strokeStyle = "#000"; // line under the column
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - this.width / 2 - 3, this.y - 0.5);
    this.ctx.lineTo(this.x - this.width / 2 + this.width + 2, this.y - 0.5);
    this.ctx.stroke();
    if (this.changable) { // if changable, draw the mark on the top of the column
        this.ctx.strokeStyle = "#BBB";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - this.width / 5, this.y - 0.5 - this.value - 3);
        this.ctx.lineTo(this.x, this.y - 0.5 - this.value - 6);
        this.ctx.lineTo(this.x + this.width / 5, this.y - 0.5 - this.value - 3);
        this.ctx.moveTo(this.x, this.y - 0.5 - this.value - 6);
        this.ctx.lineTo(this.x, this.y - 0.5 - this.value - 2);
        this.ctx.stroke();
        if (this.value > 5) {
            var r = parseInt(this.fillColor.substring(1,2), 16) - 3;
            var g = parseInt(this.fillColor.substring(2,3), 16) - 3;
            var b = parseInt(this.fillColor.substring(3,4), 16) - 3;
            if (r < 0) { r = 0; }
            if (g < 0) { g = 0; }
            if (b < 0) { b = 0; }
            this.ctx.strokeStyle = "#" + r.toString(16) + g.toString(16) + b.toString(16);            
            this.ctx.beginPath();
            this.ctx.moveTo(this.x - this.width / 5, this.y - 0.5 - this.value + 3);
            this.ctx.lineTo(this.x, this.y - 0.5 - this.value + 6);
            this.ctx.lineTo(this.x + this.width / 5, this.y - 0.5 - this.value + 3);            
            this.ctx.moveTo(this.x, this.y - 0.5 - this.value + 6);
            this.ctx.lineTo(this.x, this.y - 0.5 - this.value + 2);
            this.ctx.stroke();
        }
    }
    this.ctx.fillStyle = "#000"; // text under the column
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

// render moving rectangles when copying
inalan.VisuVariable.prototype.renderCopy = function () {
    // draw second rectangle when copying/moving the variable
    if (this.copy) {        
        this.ctx.fillStyle = this.copyColor; // column
        this.ctx.fillRect(this.copyx - this.width / 2 - 0.5, this.copyy - this.value - 0.5, this.width, this.value);
        this.ctx.strokeStyle = "#000";
        this.ctx.strokeRect(this.copyx - this.width / 2 - 0.5, this.copyy - 0.5 - this.value, this.width, this.value);
    }
}

// is the X, Y (e.g. mouse position) over the variable (in the upper part for changing the value) ?
inalan.VisuVariable.prototype.isOver = function (x, y) {
    if (Math.abs(x - this.x) < this.width / 2 && Math.abs(y - (this.y - this.value)) <= 5) {
        return true;
    }
    return false;
}

// set up copyx, copyy when starts copying the variable
inalan.VisuVariable.prototype.startCopying = function () {
    this.copyx = this.x;
    this.copyy = this.y;
    this.copy = true;
}
// stops copying the variable
inalan.VisuVariable.prototype.stopCopying = function () {
    this.copy = false;
}

// set default color
inalan.VisuVariable.prototype.setDefaultColor = function () {
    this.fillColor = this.defaultColor;
    this.strokeColor = '#000';
}
// set color when comparing
inalan.VisuVariable.prototype.setLightYellowColor = function () {
    this.fillColor = this.compareColor;
    this.strokeColor = '#000';
}
// set color when copying
inalan.VisuVariable.prototype.setYellowColor = function () {
    this.fillColor = this.copyColor;
    this.strokeColor = '#000';
}
// set gray color
inalan.VisuVariable.prototype.setGrayColor = function () {
    this.fillColor = this.grayColor;
    this.strokeColor = this.grayColor;
}
// set hidden color (hide the column)
inalan.VisuVariable.prototype.setHiddenColor = function () {
    this.fillColor = this.hiddenColor;
    this.strokeColor = this.hiddenColor;
}
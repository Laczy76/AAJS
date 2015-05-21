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

inalan.Button = function (name, label, width, onClickFnc) {
    // create subclass Button from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties
    this.label = label;
    this.width = width;
    this.height = 26;
    this.enabled = true;
    this.onClickFnc = onClickFnc;
    this.color = "#FE6";
    // color constants
    this.defaultColor = "#FE6";
    this.overColor = "#FB3";
    this.disabledColor = "#EEE";
}

// create subclass Button from VisuData - set methods
inalan.Button.prototype = Object.create(inalan.VisuData.prototype);
inalan.Button.prototype.constructor = inalan.Button;

inalan.Button.prototype.render = function () {
    // draw the button
    if (this.enabled) {
        this.ctx.fillStyle = this.color;
    } else {
        this.ctx.fillStyle = this.disabledColor;
    }
    this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    this.ctx.strokeStyle = "#000";
    this.ctx.strokeRect(this.x - this.width / 2 - 0.5, this.y - this.height / 2 - 0.5, this.width + 1, this.height + 1);
    if (this.enabled) {
        this.ctx.fillStyle = "#000";
    } else {
        this.ctx.fillStyle = "#666";
    }    
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.label, this.x, this.y + 4.5);
}

inalan.Button.prototype.isOver = function (x,y) {
    if (Math.abs(x - this.x) <= this.width / 2 && Math.abs(y - this.y) <= this.height / 2) {
        return true;
    }
    return false
}
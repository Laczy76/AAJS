/// <reference path="VisuData.js" />
/// <reference path="VisuVariable.js" />

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

inalan.VisuArray = function (name, values, changable) {
    if (typeof (changable) == "undefined") {
        changable = false;
    }
    // create subclass VisuArray from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties
    this.items = {
        length: values.length
    };
    // set indexes
    this.indexes = {};
    this.indexesPos = 0;
    this.indexesColor = "#AFA";
    // create VisuVariables
    for (var i=0; i<values.length; i++) {
        this.items[i] = new inalan.VisuVariable(name + "[" + i + "]", values[i], changable);
        this.items[i].textRotation = 45;
    }
}

// create subclass VisuArray from VisuData - set methods
inalan.VisuArray.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuArray.prototype.constructor = inalan.VisuArray;

// add/set index to the VisuArray
inalan.VisuArray.prototype.setIndex = function(name,value) {
    this.indexes[name] = value;
}
// delete label from VisuArray
inalan.VisuArray.prototype.deleteIndex = function (name) {
    delete (this.indexes[name]);
}

// redner the array by calling the render function of every item (visuVariable)
inalan.VisuArray.prototype.render = function () {
    // render VisuArray
    var maxHeight = this.items[0].height;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].height > maxHeight) {
            maxHeight = this.items[i].height;
        }
    }
    var xpos = this.x;
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].ctx = this.ctx;
        this.items[i].x = xpos;
        if (i<this.items.length-1) {
            xpos = xpos + this.items[i].width / 2 + this.items[i + 1].width / 2 + 2;
        }
        this.items[i].y = this.y;
        this.items[i].height = maxHeight;
        this.items[i].render();
        // render indexes
        var indexesPos = this.indexesPos;
        for (var name in this.indexes) {
            if (this.indexes[name] == i) {
                this.ctx.fillStyle = this.indexesColor;
                this.ctx.beginPath();
                this.ctx.arc(this.items[i].x, this.items[i].y + 45 + indexesPos - 4, 10, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.fillStyle = "#000";
                this.ctx.font = "bold 12px Arial";
                this.ctx.textAlign = "center";
                this.ctx.fillText(name, this.items[i].x, this.items[i].y + 45 + indexesPos);
                indexesPos = indexesPos + 23;
            }
        }
    }
}

// render moving rectangles when copying
inalan.VisuArray.prototype.renderCopy = function () {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].renderCopy();
    }
}
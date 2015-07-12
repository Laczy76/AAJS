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
    inalan.VisuData.call(this);
    this.name = name;
    // set new properties
    this.items = {
        length: values.length
    };
    // set indexes
    this.showIndexes = true; // show index numbers under the array
    this.indexes = {};
    this.indexesPos = 0;
    this.indexStrokeColor = "#BCC";
    this.indexFillColor = "#DEE";
    // create VisuVariables
    for (var i=0; i<values.length; i++) {
        this.items[i] = new inalan.VisuVariable(name + "[" + i + "]", values[i], changable);
        this.items[i].textRotation = 45;
    }
}

// create subclass VisuArray from VisuData - set methods
inalan.VisuArray.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuArray.prototype.constructor = inalan.VisuArray;

// randomize the array
inalan.VisuArray.prototype.randomize = function (min,max) {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].randomize(min,max);
    }
}

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
    // write the numbers under indexes
    if (this.showIndexes || Object.keys(this.indexes).length>0) {
        this.ctx.fillStyle = "#BBB";
        this.ctx.font = "bold 12px Courier New";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "alphabetic";
        for (var k = 0; k < this.items.length; k++) {
            this.ctx.fillText(k, this.items[k].x - 0.5, this.items[k].y + 50 + this.indexesPos);
        }
    }
    // go through all items in array
    for (var i = 0; i < this.items.length; i++) {
        // draw the item
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
                // draw the index circle
                this.ctx.strokeStyle = this.indexStrokeColor;
                this.ctx.fillStyle = this.indexFillColor;
                this.ctx.beginPath();
                this.ctx.arc(this.items[i].x, this.items[i].y + 71 + indexesPos - 4, 10, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                // write index name into circle
                this.ctx.fillStyle = "#000";
                this.ctx.font = "bold 14px Courier New";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "alphabetic";
                this.ctx.fillText(name, this.items[i].x - 0.5, this.items[i].y + 71 + indexesPos);
                indexesPos = indexesPos + 25;
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

// set minimum value for all items in array
inalan.VisuArray.prototype.setMinValue = function (value) {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].minValue = value;
    }
}
// set maximum value for all items in array
inalan.VisuArray.prototype.setMaxValue = function (value) {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].maxValue = value;
    }
}
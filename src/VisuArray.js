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

inalan.VisuArray = function (name, values, changeable) {
    if (typeof (changeable) == "undefined") {
        changeable = false;
    }
    // create subclass VisuArray from VisuData - set properties
    inalan.VisuData.call(this);
    this.name = name;
    // create VisuVariables as VisuArray elements
    this.length = values.length;
    for (var i=0; i<values.length; i++) {
        this[i] = new inalan.VisuVariable(name + "[" + i + "]", values[i], changeable);
        this[i].textRotation = 45;
    }
    // set indexes
    this.showIndexes = true; // show index numbers under the array
    this.indexes = {};
    this.indexesPos = 0;
    this.indexStrokeColor = "#CDD";
    this.indexFillColor = "#DEE";
}

// create subclass VisuArray from VisuData - set methods
inalan.VisuArray.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuArray.prototype.constructor = inalan.VisuArray;

// randomize the array
inalan.VisuArray.prototype.randomize = function (min,max) {
    for (var i = 0; i < this.length; i++) {
        this[i].randomize(min,max);
    }
}

// add/set index to the VisuArray
inalan.VisuArray.prototype.setIndex = function (name, value, pos) {
    if (typeof (pos) == "undefined") {
        pos = -1;
    }
    this.indexes[name] = { "value": value, "pos": pos};
}
// delete label from VisuArray
inalan.VisuArray.prototype.deleteIndex = function (name) {
    delete (this.indexes[name]);
}

// redner the array by calling the render function of every element (visuVariable)
inalan.VisuArray.prototype.render = function () {
    // render VisuArray
    var maxHeight = this[0].height;
    for (var i = 0; i < this.length; i++) {
        if (this[i].height > maxHeight) {
            maxHeight = this[i].height;
        }
    }
    var xpos = this.x;
    // write the numbers under indexes
    if (this.showIndexes || Object.keys(this.indexes).length>0) {
        this.ctx.fillStyle = "#BBB";
        this.ctx.font = "bold 12px Courier New";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "alphabetic";
        for (var k = 0; k < this.length; k++) {
            this.ctx.fillText(k, this[k].x - 0.5, this[k].y + 50 + this.indexesPos);
        }
    }
    // go through all elements in array
    for (var i = -1; i <= this.length; i++) {
        if (i >= 0 && i < this.length) {
            // draw the element
            this[i].ctx = this.ctx;
            this[i].x = xpos;
            if (i < this.length - 1) {
                xpos = xpos + this[i].width / 2 + this[i + 1].width / 2 + 2;
            }
            this[i].y = this.y;
            this[i].height = maxHeight;
            this[i].render();
        }
        // render indexes
        var fixIndexPos = [];
        for (var name in this.indexes) {
            if (this.indexes[name].value == i && this.indexes[name].pos>=0) {
                fixIndexPos = fixIndexPos.concat([this.indexes[name].pos]);
            }
        }
        var indexNames = [];
        for (var name in this.indexes) {
            indexNames = indexNames.concat([name]);
        }        
        indexNames.sort();
        for (var j=0; j<indexNames.length; j++) {            
            if (this.indexes[indexNames[j]].value == i) {
                var indexPos = this.indexesPos;
                if (this.indexes[indexNames[j]].pos >= 0) {
                    indexPos = indexPos + 27 * this.indexes[indexNames[j]].pos;
                } else {
                    var k = 0;
                    while (fixIndexPos.indexOf(k) > -1) {
                        k++;
                    }
                    fixIndexPos = fixIndexPos.concat([k]);
                    indexPos = indexPos + 27 * k;
                }
                // draw the index circle
                this.ctx.strokeStyle = this.indexStrokeColor;
                this.ctx.fillStyle = this.indexFillColor;
                this.ctx.beginPath();
                if (i >= 0 && i < this.length) {
                    this.ctx.arc(this[i].x, this[i].y + 72 + indexPos - 4, 11.5, 0, 2 * Math.PI);
                } else if (i==-1) {
                    this.ctx.arc(this[0].x - this[0].width - 2, this[0].y + 72 + indexPos - 4, 11.5, 0, 2 * Math.PI);
                } else {
                    this.ctx.arc(this[this.length - 1].x + this[this.length - 1].width + 2, this[0].y + 72 + indexPos - 4, 11.5, 0, 2 * Math.PI);
                }
                this.ctx.fill();
                this.ctx.stroke();
                // write index name into circle
                this.ctx.fillStyle = "#000";
                this.ctx.font = "bold 12px Courier New";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "alphabetic";
                if (i >= 0 && i < this.length) {
                    this.ctx.fillText(indexNames[j], this[i].x - 0.5, this[i].y + 72 + indexPos);
                } else if (i==-1) {
                    this.ctx.fillText(indexNames[j], this[0].x - this[0].width - 0.5 - 2, this[0].y + 72 + indexPos);
                } else {
                    this.ctx.fillText(indexNames[j], this[this.length - 1].x - this[this.length - 1].width - 0.5 + 2, this[0].y + 72 + indexPos);
                }
            }
        }
    }
}

// render moving rectangles when copying
inalan.VisuArray.prototype.renderCopy = function () {
    for (var i = 0; i < this.length; i++) {
        this[i].renderCopy();
    }
}

// set minimum value for all elements in array
inalan.VisuArray.prototype.setMinValue = function (value) {
    for (var i = 0; i < this.length; i++) {
        this[i].minValue = value;
    }
}
// set maximum value for all elements in array
inalan.VisuArray.prototype.setMaxValue = function (value) {
    for (var i = 0; i < this.length; i++) {
        this[i].maxValue = value;
    }
}
// set height for all elements in array
inalan.VisuArray.prototype.setHeight = function (height) {
    for (var i = 0; i < this.length; i++) {
        this[i].height = height;
    }
}
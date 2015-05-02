/// <reference path="VisuData.js" />
/// <reference path="VisuVariable.js" />

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

inalan.VisuArray = function (name, values) {
    // create subclass VisuArray from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties
    this.elements = {
        length: values.length
    };
    for (var i=0; i<values.length; i++) {
        this.elements[i] = new inalan.VisuVariable(name + "[" + i + "]", values[i]);
        this.elements[i].textRotation = 45;
    }
}

// create subclass VisuArray from VisuData - set methods
inalan.VisuArray.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuArray.prototype.constructor = inalan.VisuArray;

inalan.VisuArray.prototype.render = function () {
    // call superclass's render function
    inalan.VisuData.prototype.render.call(this);
    // render VisuArray
    var maxHeight = this.elements[0].height;
    for (var i = 0; i < this.elements.length; i++) {
        if (this.elements[i].height > maxHeight) {
            maxHeight = this.elements[i].height;
        }
    }
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].ctx = this.ctx;
        this.elements[i].x = this.x + i * 22;
        this.elements[i].y = this.y;
        this.elements[i].height = maxHeight;
        this.elements[i].render();
    }
}
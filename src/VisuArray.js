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

inalan.VisuArray = function (name, values) {
    // create subclass VisuArray from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties
    this.items = {
        length: values.length
    };
    for (var i=0; i<values.length; i++) {
        this.items[i] = new inalan.VisuVariable(name + "[" + i + "]", values[i]);
        this.items[i].textRotation = 45;
    }
}

// create subclass VisuArray from VisuData - set methods
inalan.VisuArray.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuArray.prototype.constructor = inalan.VisuArray;

inalan.VisuArray.prototype.render = function () {
    // call superclass's render function
    inalan.VisuData.prototype.render.call(this);
    // render VisuArray
    var maxHeight = this.items[0].height;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].height > maxHeight) {
            maxHeight = this.items[i].height;
        }
    }
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].ctx = this.ctx;
        this.items[i].x = this.x + i * 22;
        this.items[i].y = this.y;
        this.items[i].height = maxHeight;
        this.items[i].render();
    }
}
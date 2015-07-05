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

inalan.VisuLabel = function (name, text) {
    // create subclass VisuLabel from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties
    this.text = text;    
}

// create subclass VisuLabel from VisuData - set methods
inalan.VisuLabel.prototype = Object.create(inalan.VisuData.prototype);
inalan.VisuLabel.prototype.constructor = inalan.VisuLabel;

inalan.VisuLabel.prototype.render = function () {
    // draw the Visulabel    
    this.ctx.font = "bold 14px Arial"
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.text, this.x, this.y + 7);
}

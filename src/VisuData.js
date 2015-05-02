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

inalan.VisuData = function (name) {
    // position (upper left corner of the visualized data)
    this.x = 0;
    this.y = 0;
    // name
    this.name = name;
}

inalan.VisuData.prototype.render = function () {
    // check if the object is renderable
    if (!(this.ctx instanceof CanvasRenderingContext2D)) {
        throw "- Can not render '" + this.name + "', first you must add it to a stage."
    }
}
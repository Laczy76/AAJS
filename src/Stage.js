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

inalan.Stage = function (canvasId) {
    document.onselectstart = function () { return false; }; // prevention to select the document (e.g. accidently by double click)
    this.canvas = document.getElementById("myCanvas");
    this.canvas.parent = this; // set canvas's parent property to this Stage object (needed in canvas's mouse events handling functions)
    this.ctx = this.canvas.getContext("2d");
    this.visuItems = {};
    this.canvas.addEventListener("mousemove", this.stageMouseMoveEvent);
    this.canvas.addEventListener("mousedown", this.stageMouseDownEvent);
    this.canvas.addEventListener("mouseout", this.stageMouseUpOrOutEvent);
    this.canvas.addEventListener("mouseup", this.stageMouseUpOrOutEvent);
}

// when mousemove, change the value of dragged item, or change the mouse cursor to up-down arrow
inalan.Stage.prototype.stageMouseMoveEvent = function (evt) {
    // mouse X, Y coordinates on Canvas...
    var canvasRect = evt.target.getBoundingClientRect();
    var mouseX = evt.clientX - canvasRect.left;
    var mouseY = evt.clientY - canvasRect.top;
    // the stage object...
    var stage = evt.target.parent;
    // is dragging any column?
    var dragging = false;
    if (evt.which == 1) { // left mouse button is pushed down...
        // check all objects in visuItems
        for (var index in stage.visuItems) {
            if (stage.visuItems.hasOwnProperty(index)) {
                var obj = stage.visuItems[index];
                // *** VisuVariable ***
                if (obj instanceof inalan.VisuVariable) {
                    if (obj.dragging) {
                        if (obj.changable) {
                            // change the value of the object and render...
                            obj.value = obj.y - mouseY;
                            obj.render(false); // false = do not write the text under it during the rendering
                            dragging = true;
                        } else {
                            obj.dragging = false;
                        }
                    }
                }
                // *** VisuArray ***
                if (obj instanceof inalan.VisuArray) {
                    for (var i = 0; i < obj.items.length; i++) {
                        if (obj.items[i].dragging) {
                            if (obj.items[i].changable) {
                                // change the value of the object and render...
                                obj.items[i].value = obj.items[i].y - mouseY;
                                obj.items[i].render(false); // false = do not write the text under it during the rendering
                                dragging = true;
                            } else {
                                obj.items[i].dragging = false;
                            }
                        }
                    }
                }
            }
        }
    }
    // if not dragging any variable (not changing the value of any variable), 
    // then change the mouse cursor to default or resize...
    if (!dragging) {
        // check all objects in visuItems
        var mouseCursor = "default";
        for (var index in stage.visuItems) {
            if (stage.visuItems.hasOwnProperty(index)) {
                var obj = stage.visuItems[index];
                // *** VisuVariable ***
                if (obj instanceof inalan.VisuVariable) {
                    if (obj.changable && obj.isOver(mouseX, mouseY)) {
                        mouseCursor = "ns-resize";
                    }
                }
                // *** VisuArray ***
                if (obj instanceof inalan.VisuArray) {
                    for (var i = 0; i < obj.items.length; i++) {
                        if (obj.items[i].changable && obj.items[i].isOver(mouseX, mouseY)) {
                            mouseCursor = "ns-resize";
                        }
                    }
                }
            }
        }
        evt.target.style.cursor = mouseCursor;
    }
}

// when mouseup or mousedown, set all dragging=true for the selected item
inalan.Stage.prototype.stageMouseDownEvent = function (evt) {
    if (evt.which == 1) { // left mouse button is pushed down...
        // mouse X, Y coordinates on Canvas...
        var canvasRect = evt.target.getBoundingClientRect();
        var mouseX = evt.clientX - canvasRect.left;
        var mouseY = evt.clientY - canvasRect.top;
        // the stage object...
        var stage = evt.target.parent;
        // check all objects in visuItems
        for (var index in stage.visuItems) {
            if (stage.visuItems.hasOwnProperty(index)) {
                var obj = stage.visuItems[index];
                // *** VisuVariable ***
                if (obj instanceof inalan.VisuVariable) {
                    if (obj.changable && obj.isOver(mouseX, mouseY)) {
                        obj.dragging = true;
                    }
                }
                // *** VisuArray ***
                if (obj instanceof inalan.VisuArray) {
                    for (var i = 0; i < obj.items.length; i++) {
                        if (obj.items[i].changable && obj.items[i].isOver(mouseX, mouseY)) {
                            obj.items[i].dragging = true;
                        }
                    }
                }
            }
        }
    }
}

// when mouseup or mouseout, set all dragging=false for all items
inalan.Stage.prototype.stageMouseUpOrOutEvent = function (evt) {
    if (evt.type == "mouseout" || evt.which == 1) { // mouse out OR left mouse button is released down...
        // mouse X, Y coordinates on Canvas...
        var canvasRect = evt.target.getBoundingClientRect();
        var mouseX = evt.clientX - canvasRect.left;
        var mouseY = evt.clientY - canvasRect.top;
        // the stage object...
        var stage = evt.target.parent;
        // check all objects in visuItems
        for (var index in stage.visuItems) {
            if (stage.visuItems.hasOwnProperty(index)) {
                var obj = stage.visuItems[index];
                // *** VisuVariable ***
                if (obj instanceof inalan.VisuVariable) {
                    obj.dragging = false;
                }
                // *** VisuArray ***
                if (obj instanceof inalan.VisuArray) {
                    for (var i = 0; i < obj.items.length; i++) {
                        obj.items[i].dragging = false;
                    }
                }
            }
        }
    }
}

// render the whole stage
inalan.Stage.prototype.render = function () {
    // clear the stage
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // render all objects in visuData
    for (var index in this.visuItems) {
        if (this.visuItems.hasOwnProperty(index)) {
            this.visuItems[index].render();
        }
    }
}

// adding VisuVariable or VisuArray to stage
inalan.Stage.prototype.add = function (visuData) {
    if (typeof (this.visuItems[visuData.name]) != 'undefined') {
        throw "- Can not add '" + visuData.name + "' to the stage, object with this name already exists on the stage.";
    }
    visuData.ctx = this.ctx;
    this.visuItems[visuData.name] = visuData;
}

// animation of comparing two visuVariables (firstObject and secondObject)
inalan.Stage.prototype.compare = function (firstObject, secondObject, callBackFnc) {

}

// animation of exchanging two visuVariables (firstObject and secondObject)
inalan.Stage.prototype.exchange = function (firstObject, secondObject, callBackFnc) {

}

// animation of copying a visuVariable (firstObject to secondObject)
inalan.Stage.prototype.copy = function (firstObject, secondObject, callBackFnc) {

}

// animation of moving a visuVariable (firstObject to secondObject)
inalan.Stage.prototype.move = function (firstObject, secondObject, callBackFnc) {

}


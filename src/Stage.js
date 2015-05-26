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
    document.onselectstart = function () { return false; }; // prevention to select the document (e.g. accidentally by double clicking)
    this.canvas = document.getElementById("myCanvas");
    this.canvas.parent = this; // set canvas's parent property to this Stage object (needed in canvas's mouse events handling functions)
    this.ctx = this.canvas.getContext("2d");
    // elements on stage... *****************************
    this.visuItems = {};
    // add controller to stage... ***********************
    this.controller = new inalan.Controller();
    this.controller.x = 20;
    this.controller.y = this.ctx.canvas.height - 35;
    this.add(this.controller);
    // event listeners **********************************
    this.canvas.addEventListener("mousemove", this.stageMouseMoveEvent);
    this.canvas.addEventListener("mousedown", this.stageMouseDownEvent);
    this.canvas.addEventListener("mouseout", this.stageMouseUpOrOutEvent);
    this.canvas.addEventListener("mouseup", this.stageMouseUpOrOutEvent);
    // rendering setting ********************************
    var self = this;
    this.fps = 24;
    this.render = function (evt) { // rendering the stage
        // clear the stage
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
        // render all objects in visuData
        for (var index in self.visuItems) {
            if (self.visuItems.hasOwnProperty(index)) {
                self.visuItems[index].render();
            }
        }
        // render object when copying
        for (var index in self.visuItems) {
            if (self.visuItems.hasOwnProperty(index)) {
                if (self.visuItems[index] instanceof inalan.VisuVariable
                 || self.visuItems[index] instanceof inalan.VisuArray) {
                    self.visuItems[index].renderCopy();
                }                
            }
        }
    }
    setInterval(this.render, 1000 / this.fps);
    // time for animations (copy/move/exchange/..) *****
    this.animating = false; // does any object animating?
    this.time = 1000; // speed of animation
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
                // *** Button ***
                if (obj instanceof inalan.Button && obj.enabled) {
                    if (obj.isOver(mouseX, mouseY)) {
                        obj.color = obj.overColor;
                        mouseCursor = "pointer";
                    } else {
                        obj.color = obj.defaultColor;
                    }
                }
                // *** Scrollbar ***
                if (obj instanceof inalan.Scrollbar && obj.enabled) {
                    if (obj.isOver(mouseX, mouseY)) {
                        obj.color = obj.overColor;
                        mouseCursor = "pointer";
                    } else {
                        obj.color = obj.defaultColor;
                    }
                }
                // *** Controller ***
                if (obj instanceof inalan.Controller) {
                    for (var i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            var obj2 = obj[i];
                            // button within the controller
                            if (obj2 instanceof inalan.Button) {
                                if (obj2.isOver(mouseX, mouseY) && obj2.enabled) {
                                    obj2.color = obj2.overColor;
                                    mouseCursor = "pointer";
                                } else {
                                    obj2.color = obj2.defaultColor;
                                }
                            }
                            // scrollbar within the controller
                            if (obj2 instanceof inalan.Scrollbar) {
                                if (obj2.isOver(mouseX, mouseY) && obj2.enabled) {
                                    obj2.color = obj2.overColor;
                                    mouseCursor = "pointer";
                                } else {
                                    obj2.color = obj2.defaultColor;
                                }
                            }
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
                // *** Button ***
                if (obj instanceof inalan.Button && obj.enabled) {
                    if (obj.isOver(mouseX, mouseY)) {
                        obj.onClickFnc();
                    }
                }
                // *** Controller ***
                if (obj instanceof inalan.Controller) {
                    for (var i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            var obj2 = obj[i];
                            // button within the controller
                            if (obj2 instanceof inalan.Button) {
                                if (obj2.isOver(mouseX, mouseY) && obj2.enabled) {
                                        obj2.onClickFnc();
                                }
                            }
                        }
                    }                    
                }
            }
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
    this.visuItems[visuData.name].render();
}

// get VisuVariable or VisuArray by name
inalan.Stage.prototype.get = function (name) {
    return this.visuItems[name];
}

// animation of comparing two visuVariables (firstObject and secondObject)
inalan.Stage.prototype.compare = function (firstObject, secondObject) {
    this.animating = true;
    firstObject.setCompareColor();
    secondObject.setCompareColor();
    this.animating = false;
}

// animation of copying a visuVariable (firstObject to secondObject)
inalan.Stage.prototype.copy = function (firstObject, secondObject) {
    this.animating = true;
    var ch1 = firstObject.changable;
    var ch2 = secondObject.changable;
    firstObject.changable = false;
    secondObject.changable = false;
    var stage = this;
    var distance = Math.sqrt(Math.pow(firstObject.x - secondObject.x, 2) + Math.pow(firstObject.y - secondObject.y, 2)); // distance between points
    var time = distance * this.time / 100; // time for animation (this.time ... 100 px)
    var fps = this.fps; // FPS
    var frames = Math.floor(time * fps / 1000); // how many frames
    var intervalId = setInterval(function () { copyFnc(); }, 1000 / fps);
    var dx = (secondObject.x - firstObject.x) / frames;
    var dy = (secondObject.y - firstObject.y) / frames;
    var x = firstObject.x;
    var y = firstObject.y;
    firstObject.setCompareColor();    
    firstObject.startCopying();
    var copyFnc = function () {
        frames--;
        if (frames > 0) {
            firstObject.copyx += dx;
            firstObject.copyy += dy;
        } else if (frames <= 0) {
            firstObject.stopCopying();
            secondObject.value = firstObject.value;
            secondObject.setCopyColor();     
            clearInterval(intervalId);
            firstObject.changable = ch1;
            secondObject.changable = ch2;
            stage.animating = false;
        }
    }
}

// animation of moving a visuVariable (firstObject to secondObject)
inalan.Stage.prototype.move = function (firstObject, secondObject) {
    this.animating = true;
    var ch1 = firstObject.changable;
    var ch2 = secondObject.changable;
    firstObject.changable = false;
    secondObject.changable = false;
    var stage = this;
    var distance = Math.sqrt(Math.pow(firstObject.x - secondObject.x, 2) + Math.pow(firstObject.y - secondObject.y, 2)); // distance between points
    var time = distance * this.time / 100; // time for animation (this.time ... 100 px)
    var fps = this.fps; // FPS
    var frames = Math.floor(time * fps / 1000); // how many frames
    var intervalId = setInterval(function () { copyFnc(); }, 1000 / fps);
    var dx = (secondObject.x - firstObject.x) / frames;
    var dy = (secondObject.y - firstObject.y) / frames;
    var x = firstObject.x;
    var y = firstObject.y;
    firstObject.setGrayColor();
    firstObject.startCopying();
    var copyFnc = function () {
        frames--;
        if (frames > 0) {
            firstObject.copyx += dx;
            firstObject.copyy += dy;
        } else if (frames <= 0) {
            firstObject.stopCopying();
            secondObject.value = firstObject.value;
            secondObject.setCopyColor();
            clearInterval(intervalId);
            firstObject.changable = ch1;
            secondObject.changable = ch2;
            stage.animating = false;         
        }
    }
}

// animation of exchanging two visuVariables (firstObject and secondObject)
inalan.Stage.prototype.exchange = function (firstObject, secondObject) {
    this.animating = true;
    var ch1 = firstObject.changable;
    var ch2 = secondObject.changable;
    firstObject.changable = false;
    secondObject.changable = false;
    var stage = this;
    var distance = Math.sqrt(Math.pow(firstObject.x - secondObject.x, 2) + Math.pow(firstObject.y - secondObject.y, 2)); // distance between points
    var time = distance * this.time / 100; // time for animation (this.time ... 100 px)
    var fps = this.fps; // FPS
    var frames = Math.floor(time * fps / 1000); // how many frames
    var intervalId = setInterval(function () { copyFnc(); }, 1000 / fps);
    var dx = (secondObject.x - firstObject.x) / frames;
    var dy = (secondObject.y - firstObject.y) / frames;
    var x1 = firstObject.x;
    var y1 = firstObject.y;
    var x2 = secondObject.x;
    var y2 = secondObject.y;
    firstObject.setHiddenColor();
    secondObject.setHiddenColor();
    firstObject.startCopying();
    secondObject.startCopying();
    var copyFnc = function () {
        frames--;
        if (frames > 0) {
            firstObject.copyx += dx;
            firstObject.copyy += dy;
            secondObject.copyx -= dx;
            secondObject.copyy -= dy;
        } else if (frames <= 0) {
            firstObject.stopCopying();
            secondObject.stopCopying();
            var x = secondObject.value
            secondObject.value = firstObject.value;
            firstObject.value = x;
            firstObject.setCopyColor();
            secondObject.setCopyColor();
            clearInterval(intervalId);
            firstObject.changable = ch1;
            secondObject.changable = ch2;
            stage.animating = false;
        }
    }
}

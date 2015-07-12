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

inalan.Controller = function () {    
    // set properties        
    this.x = 0;
    this.y = 0;
    this.fncIndex = 0; // index in stepFncsArray
    this.fncRepeatIndex = 0; // index in array inside stepFncsArray (for repeating some steps)   
    this.stepFncsArray = null; // array of functions for every step
    this.playingAnimation = false; // playing animation (Start/Stop button)
    this.waitingAnimation = false; // animation is waiting (animation is waiting im delay between steps when automatically playing)
    this.nextStepAuto = -1; // automatically play the next step
    this.undo = []; // undo array to save steps (object properties and variables)
    var self = this;
    // variables for button labels
    this.resetLabel = "Reset";
    this.startLabel = "Start";
    this.stopLabel = "Stop";
    this.prevLabel = "Previous step";
    this.nextLabel = "Next step";
    this.speedLabel = "Speed of animation:";    
    // restore a step from undo array
    var restoreStepFromUndo = function (stepNumber) {
        var stage = self.ctx.canvas.parent;
        // copy attributes from var/visuItems to stage.variables/stage.visuItems
        var copyAttributes = function (obj1, obj2) {
            for (var i in obj1) {
                if (typeof (obj1[i]) === 'object') {
                    if (obj1[i] instanceof Array) {
                        obj2[i] = obj1[i];
                    } else {
                        if (!obj2.hasOwnProperty(i)) {
                            obj2[i] = {};
                        }
                        copyAttributes(obj1[i], obj2[i]);
                    }
                } else {
                    obj2[i] = obj1[i];
                }
            }
        }
        // delete unnecessary atributes (added in next step) from stage.variables/stage.visuItems
        var deleteAttributes = function (obj1, obj2) {
            for (var i in obj2) {
                if (typeof (obj2[i]) === 'object' && obj1.hasOwnProperty(i)) {
                    deleteAttributes(obj1[i], obj2[i]);
                } else {
                    if (!obj1.hasOwnProperty(i)) {
                        delete obj2[i];
                    }
                }
            }
        }
        var variables = JSON.parse(self.undo[stepNumber][1]);
        copyAttributes(variables, stage.variables);
        deleteAttributes(variables, stage.variables);
        var visuItems = JSON.parse(self.undo[stepNumber][2]);
        copyAttributes(visuItems, stage.visuItems);
        deleteAttributes(visuItems, stage.visuItems);
        // restore fncIndex and fncRepeatIndex
        self.fncIndex = self.undo[stepNumber][3];
        self.fncRepeatIndex = self.undo[stepNumber][4];
        // restore arrow
        stage.showArrow = JSON.parse(self.undo[stepNumber][5]);
    }
    // reset animation (restore the first step from undo array)
    var resetAnimationWhenPossible = false;
    var resetAnimation = function () { // reset animation
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation) {
            resetAnimationWhenPossible = false;
            self.playingAnimation = false;
            self.nextStepAuto = -1;
            self.startStop.text = self.startLabel;
            restoreStepFromUndo(0);
            self.undo = [];
            self.reset.enabled = false;
            self.startStop.enabled = true;
            self.prevStep.enabled = false;            
            self.nextStep.enabled = true;            
        } else if (stage.animating>0 || self.waitingAnimation) {
            resetAnimationWhenPossible = true;
        }
    }
    // step the animation backward one step
    var prevStepAnimation = function () { 
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation) {
            var i = self.undo.length - 1;
            // restore step from undo array
            restoreStepFromUndo(i);
            // remove the last element from undo array
            self.undo = self.undo.slice(0,i);
            if (self.undo.length == 0) {
                self.reset.enabled = false;
                self.prevStep.enabled = false;
            }
            self.startStop.enabled = true;
            self.nextStep.enabled = true;
        }
    }
    // functions to control the animation...     
    var startStopAnimation = function () { // starts/stops animation
        var stage = self.ctx.canvas.parent;
        if (!self.playingAnimation) {
            // start animation
            self.playingAnimation = true;
            self.startStop.text = self.stopLabel;
            self.prevStep.enabled = false;
            self.nextStep.enabled = false;
            if (stage.animating==0) {
                nextStepAnimation();
            }
        } else {
            // stop animation
            self.playingAnimation = false;
            self.startStop.text = self.startLabel;
            if (self.undo.length > 0) {
                self.prevStep.enabled = true;
            }
            self.nextStep.enabled = true;
        }
    }
    var waitAnimationDone = function () { // this function runs when the waiting is done
        self.waitingAnimation = false;
        if (resetAnimationWhenPossible) {
            resetAnimation();
        } else if (self.playingAnimation || self.nextStepAuto>=0) {
            nextStepAnimation();
        }
    }
    var nextStepAnimationDoneID; // the ID from setInterval for nextStepAnimationDone fuction
    var nextStepAnimationDone = function () { // this function checks every 0.1 sec if the animation is done
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation) {
            clearInterval(nextStepAnimationDoneID);
            if (resetAnimationWhenPossible) {
                resetAnimation();
            } else if (self.nextStepAuto>=0) {
                self.waitingAnimation = true;
                setTimeout(waitAnimationDone, stage.time/1000*self.nextStepAuto);
            } else if (self.playingAnimation) {
                self.waitingAnimation = true;
                setTimeout(waitAnimationDone, stage.time);
            }
        }
    }
    var nextStepAnimation = function () { // step the animation forward
        var stage = self.ctx.canvas.parent;
        if (stage.animating==0 && !self.waitingAnimation && self.stepFncsArray != null) {            
            // saving objects on stage to undo array (stage.visuItems, stage.variables, self.fncIndex, self.fncRepeatIndex)
            if (self.nextStepAuto<0) {
                // enable reset, and enable prevStep button if not autoplaying the animation
                self.reset.enabled = true;
                if (!self.playingAnimation) {
                    self.prevStep.enabled = true;
                }
                // save object properties and variables into undo array
                var i = self.undo.length;
                self.undo[i] = new Array();
                self.undo[i][1] = JSON.stringify(stage.variables);
                self.undo[i][2] = JSON.stringify(stage.visuItems);
                self.undo[i][3] = self.fncIndex;
                self.undo[i][4] = self.fncRepeatIndex;
                self.undo[i][5] = JSON.stringify(stage.showArrow);
            }
            // step animation...
            stage.showArrow = [];
            stage.stopCopyingAndComparing();
            if (self.stepFncsArray[self.fncIndex] instanceof Array) { // repeating some steps
                self.nextStepAuto = self.stepFncsArray[self.fncIndex][self.fncRepeatIndex]();
                if (typeof(self.nextStepAuto) == 'undefined') {
                    self.nextStepAuto = -1;
                }
                self.fncRepeatIndex++;
                if (self.fncRepeatIndex >= self.stepFncsArray[self.fncIndex].length) {
                    self.fncRepeatIndex = 0;
                    if (!self.stepFncsArray[self.fncIndex + 1]()) {
                        self.fncIndex = self.fncIndex + 2;
                        if (self.fncIndex >= self.stepFncsArray.length) {
                            self.nextStepAuto = -1;
                            self.playingAnimation = false;
                            self.nextStep.enabled = false;
                            self.startStop.enabled = false;
                        }
                    }
                }
            } else { // steps without repetations
                self.nextStepAuto = self.stepFncsArray[self.fncIndex]();
                if (typeof(self.nextStepAuto) == 'undefined') {
                    self.nextStepAuto = -1;
                }
                self.fncIndex++;
                if (self.fncIndex >= self.stepFncsArray.length) {
                    self.nextStepAuto = -1;
                    self.playingAnimation = false;
                    if (self.undo.length > 0) {
                        self.prevStep.enabled = true;
                    }
                    self.nextStep.enabled = false;
                    self.startStop.enabled = false;
                    self.startStop.text = self.startLabel;
                }
            }
            nextStepAnimationDoneID = setInterval(nextStepAnimationDone, 100); // checks every 100ms if the animation is done
        }
    }
    var changeSpeedOfAnimation = function (position) { // when the speed of animation is changed (using the scrollbar)
        var stage = self.ctx.canvas.parent;
        stage.time = 2000 - position;
    }
    // buttons...
    this.reset = new inalan.VisuButton(this.resetLabel, 70, resetAnimation);    
    this.prevStep = new inalan.VisuButton(this.prevLabel, 120, prevStepAnimation);
    this.startStop = new inalan.VisuButton(this.startLabel, 0, startStopAnimation);
    this.nextStep = new inalan.VisuButton(this.nextLabel, 100, nextStepAnimation);
    this.reset.enabled = false;
    this.prevStep.enabled = false;
    // scrollbar...
    this.speed = new inalan.VisuScrollbar(this.speedLabel, 150, 200, 1800, 1000, changeSpeedOfAnimation);
}

// show all buttons (reset, startStop, step, speed),
// in default mode the startStop button is hidden
inalan.Controller.prototype.showAllButtons = function () {
    this.reset.width = 70;
    this.startStop.width = 70;
    this.prevStep.width = 120;
    this.nextStep.width = 100;
    this.speed.width = 150;
}

// render the controller
inalan.Controller.prototype.render = function () {
    // draw a line above the buttons
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#000";
    this.ctx.moveTo(0, this.y - 40 + 0.5);
    this.ctx.lineTo(this.ctx.canvas.clientWidth, this.y - 40 + 0.5);
    this.ctx.stroke();
    // draw the buttons
    var spaceWidth = 0;
    if (this.reset.width > 0) {
        this.reset.ctx = this.ctx;
        this.reset.x = this.x + this.reset.width / 2;
        this.reset.y = this.y;
        this.reset.render();
        spaceWidth += 20;
    }
    if (this.startStop.width > 0) {
        this.startStop.ctx = this.ctx;
        this.startStop.x = this.x + this.reset.width + this.startStop.width / 2 + spaceWidth;
        this.startStop.y = this.y;
        this.startStop.render();
        spaceWidth += 20;
    }
    if (this.prevStep.width > 0) {
        this.prevStep.ctx = this.ctx;
        this.prevStep.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width / 2 + spaceWidth;
        this.prevStep.y = this.y;
        this.prevStep.render();
    } 
    if (this.nextStep.width > 0) {
        this.nextStep.ctx = this.ctx;
        this.nextStep.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width + this.nextStep.width / 2 + spaceWidth;
        this.nextStep.y = this.y;
        this.nextStep.render();
    }
    // draw the scrollbar
    if (this.speed.width > 0) {
        this.speed.ctx = this.ctx;
        this.speed.x = this.x + this.reset.width + this.startStop.width + this.prevStep.width + this.nextStep.width + 30 + this.speed.width / 2 + spaceWidth;
        this.speed.y = this.y;
        this.speed.render();
    }
}

// set up functions for steps, for checking (if true, repeat the steps), and for the last step
inalan.Controller.prototype.setSteps = function (stepsFncsArray) {
    this.stepFncsArray = stepsFncsArray;
}

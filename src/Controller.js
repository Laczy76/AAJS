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
    // create subclass Controller from VisuData - set properties
    inalan.VisuData.call(this, name);
    // set new properties        
    this.fncIndex = 0;
    this.resetFnc = null; // function for reseting variables (reset button)   
    this.stepFncsArray = null; // array of functions for every step
    this.checkFnc = null; // check function - if true, reapeat the steps in stepFncsArray
    this.finalStepFnc = null; // final step, will be run when the check function is false
    this.playingAnimation = false; // playing animation (Start/Stop button)
    this.waitingAnimation = false; // animation is waiting (delay between steps when automatically playing)
    this.nextStepAuto = false; // automatically play the next step
    var self = this;
    // functions to control the animation... 
    var resetAnimationWhenPossible = false;
    var resetAnimation = function () { // reset animation
        var stage = self.ctx.canvas.parent;
        if (!stage.animating && !self.waitingAnimation && self.resetFnc != null) {
            resetAnimationWhenPossible = false;
            self.playingAnimation = false;
            self.startStop.label = "Start";
            self.fncIndex = 0;
            self.resetFnc();
            self.startStop.enabled = true;
            self.step.enabled = true;
        } else if (stage.animating || self.waitingAnimation) {
            resetAnimationWhenPossible = true;
        }
    }
    var startStopAnimation = function () { // starts/stops animation
        var stage = self.ctx.canvas.parent;
        if (!self.playingAnimation) {
            // start animation
            self.playingAnimation = true;
            self.startStop.label = "Stop";
            self.step.enabled = false;
            if (!stage.animating) {
                stepAnimation();
            }
        } else {
            // stop animation
            self.playingAnimation = false;
            self.startStop.label = "Start";
            self.step.enabled = true;
        }
    }
    // variables for waiting between steps
    var waitAnimationDone = function () { // this function runs when the waiting is done
        self.waitingAnimation = false;
        if (resetAnimationWhenPossible) {
            resetAnimation();
        } else if (self.playingAnimation) {
            stepAnimation();
        }
    }
    // variables for animation steps
    var stepAnimationDoneID; // the ID from setInterval for stepAnimationDone fuction
    var stepAnimationDone = function () { // this function checks every 0.1 sec if the animation is done
        var stage = self.ctx.canvas.parent;
        if (!stage.animating) {
            clearInterval(stepAnimationDoneID);
            if (resetAnimationWhenPossible) {
                resetAnimation();
            } else if (self.nextStepAuto) {
                stepAnimation();
            } else if (self.playingAnimation) {
                self.waitingAnimation = true;
                setTimeout(waitAnimationDone,stage.time);
            }
        }
    }
    var stepAnimation = function () { // steps animation        
        var stage = self.ctx.canvas.parent;
        if (!stage.animating && !self.waitingAnimation && self.stepFncsArray != null && self.checkFnc()) {
            self.nextStepAuto = self.stepFncsArray[self.fncIndex]();
            self.fncIndex++;
            if (self.fncIndex >= self.stepFncsArray.length) {
                if (self.checkFnc()) {
                    self.fncIndex = 0;
                }
            }
            stepAnimationDoneID = setInterval(stepAnimationDone, 100);
        } else if (!stage.animating && !self.waitingAnimation && !self.checkFnc()) {
            if (self.finalStepFnc != null) {
                self.finalStepFnc();
                self.nextStepAuto = false;
                self.playingAnimation = false;
            }
            self.step.enabled = false;
            self.startStop.enabled = false;
        }
    }
    // buttons...
    this.reset = new inalan.Button("reset", "Reset", 70, resetAnimation);
    this.startStop = new inalan.Button("startStop", "Start", 70, startStopAnimation);
    this.step = new inalan.Button("step", "Next step", 100, stepAnimation);
}

// create subclass VisuButton from VisuData - set methods
inalan.Controller.prototype = Object.create(inalan.VisuData.prototype);
inalan.Controller.prototype.constructor = inalan.Controller;

inalan.Controller.prototype.render = function () {
    // draw the buttons
    this.reset.ctx = this.ctx;
    this.reset.x = this.x + this.reset.width / 2;
    this.reset.y = this.y;
    this.reset.render();
    this.startStop.ctx = this.ctx;
    this.startStop.x = this.x + this.reset.width + 20 + this.startStop.width / 2;
    this.startStop.y = this.y;
    this.startStop.render();
    this.step.ctx = this.ctx;
    this.step.x = this.x + +this.reset.width + 20 + this.startStop.width + this.step.width / 2;
    this.step.y = this.y;
    this.step.render();
}

// set up reset function
inalan.Controller.prototype.setReset = function (resetFnc) {
    this.resetFnc = resetFnc;
}

// set up functions for steps, for checking (if true, repeat the steps), and for the last step
inalan.Controller.prototype.setSteps = function (stepsFncsArray, checkFnc, lastStepFnc) {
    this.stepFncsArray = stepsFncsArray;
    this.checkFnc = checkFnc;
    this.finalStepFnc = lastStepFnc;
}
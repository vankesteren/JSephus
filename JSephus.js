// Copyright (c) 2017 Erik-Jan van Kesteren
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

class JSephus {  
  // -----------
  // Constructor
  // -----------
  constructor(parentsvgId, n) {
    // construct parent info
    if (typeof parentsvgId === "string") {
      this.parent = document.getElementById(parentsvgId);
    } else if (typeof parentsvgId === "object") {
      this.parent = parentsvgId;
    } 
    if (typeof this.parent != "object") {
      throw Error("Input parent id or DOM object.")
    }
    this.namespace = this.parent.namespaceURI;
    if (this.namespace != "http://www.w3.org/2000/svg") {
      throw Error("Parent is not a proper svg element!");
    }
    this.midPoint = [this.parent.viewBox.baseVal.width/2, 
                     this.parent.viewBox.baseVal.height/2];
    
    
    // -------------------------
    // BEGIN SETTABLE PROPERTIES
    // -------------------------
    
    // Progress
    this.progress = 0.0; // 0.0 - 1.0
    
    // Circle properties
    this.n = n; // Int
    this.colour = true; // Bool
    this.alpha = 1; // 0.0 - 1.0
    this.dist = Math.min(this.midPoint[0], this.midPoint[1])*2/3; // > 0.0
    this.radius = 10; // > 0.0
    this.precision = 0.001; // 0.0 - 1.0
    
    // Text properties
    this.displayText = true;
    this.fontSize = "60"; // font size in pts
    this.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
    this.textOpacity = "1.0"; // 0.0 - 1.0
    this.textColour = "rgb(60, 150, 120)" // String (css)
    
    // Transition properties
    this.disappear = true; // Bool
    this.transDist = this.dist / 5; // > 0.0
    this.transDuration = "0.4s"; // String (css)
    this.transFunction = "cubic-bezier(.59, .01, .39, .97)"; // String (css)
    
    // -----------------------
    // END SETTABLE PROPERTIES
    // -----------------------
    
    
    // circle information
    this.angles = this._createAngles(n);
    this.circs = [];
    this.josephusInd = this._calcJosephus();
    
    // text element
    this.text = Math.round(this.progress*100);
    
    // init by calculating circles & text
    this._calcCircs();
    this._createTextElement();
  }
  
  // ------------------------------
  // Interaction (public) functions
  // ------------------------------
  init() {
    // Initialise the progress bar
    this.setProgress(1.0);
    this.hideText();
    this._draw();
    let jsph = this;
    setTimeout(function () {
      jsph.reset();
      if (jsph.displayText) jsph.showText();
    }, 500);
    return this;
  }
  
  setProperty(property, value) {
    // Set a single property or a range of properties
    if (typeof property === "string") {
      this[property] = value;
    } else if (property.constructor === Array && value.constructor === Array) {
      for (var i = 0; i < property.length; i++) {
        this[property[i]] = value[i];
      }
    }
    this._createAngles();
    this._calcCircs();
    this._createTextElement();
    if (init) this.init();
    return this;
  }
  
  // Basic progress bar functionality
  reset() {
    // Reset the progress bar to 0
    this.setProgress(0.0);
    if (this.displayText) this.showText();
    return this;
  }
  
  setProgress(prop) {
    // Set the progress bar to a proportion \in [0, 1]
    this.progress = prop;
    this._updateCircs();
    this._updateText();
    return this;
  }
  
  hideText() {
    this.textElem.style.opacity = 0.0;
    return this;
  }
  
  showText() {
    this.textElem.style.opacity = this.textOpacity;
    return this;
  }
  
  // Automated countdown / countup functionality
  async start(time = 10000, callback = function(jsph) {return jsph}) {
    let ms = time*this.precision;
    
    this.timer = setInterval( () => {
      if (this.progress < 1) {
        this.setProgress(this.progress + this.precision);
      } else {
        clearInterval(this.timer);
        callback(this);
      }
    }, ms);
  }
  
  async reverse(time = 10000, callback = function(jsph) {return jsph}) {
    let ms = time*this.precision;
    
    this.timer = setInterval( () => {
      if (this.progress > 0) {
        this.setProgress(this.progress - this.precision);
      } else {
        clearInterval(this.timer);
        callback(this);
      }
    }, ms);
  }
  
  stop() {
    clearInterval(this.timer);
    return this;
  }
  
  // ----------------------------------
  // Static methods / utility functions
  // ----------------------------------
  static createSVG(parentId, svgId, viewBoxWidth, viewBoxHeight) {
    let par = document.getElementById(parentId);
    let s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let vb = "0 0 " + viewBoxWidth + " " + viewBoxHeight;
    s.setAttributeNS(null, "id", svgId);
    s.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", vb);
    par.appendChild(s);
    return s;
  }

  
  // ------------------------
  // Pseudo-private functions
  // ------------------------
  
  // Constructor functions
  _createAngles(n) {
    let step = 360/n;
    let out = [0];
    for (var i = 1; i < n; i++) {
      out.push(i*step);
    }
    return out;
  }
  
  _createCircle(angle) {
    var circle = document.createElementNS(this.namespace, "circle");
    
    let x = this.dist * Math.cos(this._toRad(angle-90));
    let y = this.dist * Math.sin(this._toRad(angle-90));
    
    circle.setAttributeNS(null, "cx", this.midPoint[0] + x);
    circle.setAttributeNS(null, "cy", this.midPoint[1] + y);
    circle.setAttributeNS(null, "r", this.radius);
    if (this.colour) {
      circle.setAttributeNS(null, "fill", "hsl(" + angle + ", 70%, 50%)");
    } else {
      circle.setAttributeNS(null, "fill", "rgb(128, 128, 128)")
    }
    circle.setAttributeNS(null, "id", "jos" + this.circs.length);
    circle.setAttributeNS(null, "class", "josCirc");
    circle.setAttributeNS(null ,"fill-opacity", this.alpha.toString());
    
    // CSS rules
    circle.style.opacity = "1";
    circle.style.transitionProperty = "all";
    circle.style.transitionDuration = this.transDuration;
    circle.style.transitionTimingFunction = this.transFunction;
    
    
    return circle;
  }
  
  _calcCircs() {
    this.circs = [];
    for (var i = 0; i < this.angles.length; i++){
      this.circs.push(this._createCircle(this.angles[i]))
    }
  }
  
  _calcJosephus() {
    let items = new Array(this.n).fill(0).map((_, idx) => { return idx+1; });
    let sequence = [];
    let count = 1;
    let idx = 0;
    while (items.length > 1) {
        if (idx === items.length) {
            idx = 0;
        }
        if (count === 2) {
            sequence = sequence.concat(items.splice(idx, 1));
            count = 0;
            idx -= 1;
        }
        count++;
        idx++;
    }
    sequence.push(items.pop());
    return sequence;
  }
  
  _draw() {
    // first remove children (re-initialise)
    while (this.parent.firstChild) {
      this.parent.removeChild(this.parent.firstChild);
    }
    
    // Then add circs
    for (var i = 0; i < this.circs.length; i++) {
      this.parent.appendChild(this.circs[i]);
    }
    
    // Then add text element
    this.parent.appendChild(this.textElem);
  }
  
  _createTextElement() {
    var textElem = document.createElementNS(this.namespace, "text");
    textElem.setAttributeNS(null,"x", this.midPoint[0]);
    textElem.setAttributeNS(null,"y", this.midPoint[1]);
    textElem.setAttributeNS(null, "text-anchor", "middle");
    textElem.setAttributeNS(null, "alignment-baseline", "middle");
    // IE fix? textElem.setAttributeNS(null, "dy", ".4em");
    
    
    textElem.setAttributeNS(null,"font-size", this.fontSize);
    textElem.setAttributeNS(null,"font-family", this.fontFamily);
    textElem.setAttributeNS(null, "fill", this.textColour);
    
    textElem.style.opacity = this.textOpacity;
    textElem.style.transitionProperty = "all";
    textElem.style.transitionDuration = this.transDuration;
    textElem.style.transitionTimingFunction = this.transFunction;
    
    var textNode = document.createTextNode(this.text.toString());
    textElem.appendChild(textNode);
    
    this.textElem = textElem;
  }
  
  
  // Dynamic functions
  _updateCircs() {
    let whichStep = Math.max(
                    Math.min(
                    Math.floor(this.n*this.progress), 
                    this.n),
                    0); // force within 0-1
    for (var i = whichStep; i < this.n; i++) {
      this._resetCirc(this.josephusInd[i]-1);
    }
    for (var i = 0; i < whichStep; i++) {
      this._removeCirc(this.josephusInd[i]-1);
    }
  }
  
  _removeCirc(k) {
    if (this.disappear) this.circs[k].style.opacity = "0";
    let transx = this.transDist*Math.cos(this._toRad(this.angles[k]-90));
    let transy = this.transDist*Math.sin(this._toRad(this.angles[k]-90));
    let trans = "translate(" + transx + "px, " + transy + "px)";
    this.circs[k].style.transform = trans;
  }
  
  _resetCirc(k) {
    this.circs[k].style.opacity = "1";
    this.circs[k].style.transform = "translate(0px, 0px)";
  }
  
  _toRad(degrees) {
    return degrees * Math.PI / 180;
  }
  
  _updateText() {
    this.text = Math.round(this.progress*100);
    this.textElem.textContent = this.text.toString();
  }
  
}

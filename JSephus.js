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
    this.textColour = "rgb(60, 150, 120)"; // String (css)
    this.textTransform = "translate(0px, 0px)";
    
    // Transition properties
    this.disappear = true; // Bool
    this.transDist = this.dist / 5; // > 0.0
    this.transDuration = "0.4s"; // String (css)
    this.transFunction = "cubic-bezier(.59, .01, .39, .97)"; // String (css)
    
    // create a dictionary of these settable properties for setProperty()
    this.settable = {
      "n": typeof this.n,
      "colour": typeof this.colour,
      "alpha": typeof this.alpha,
      "dist": typeof this.dist,
      "radius": typeof this.radius,
      "precision": typeof this.precision,
      "displayText": typeof this.displayText,
      "fontSize": typeof this.fontSize,
      "fontFamily": typeof this.fontFamily,
      "textOpacity": typeof this.textOpacity,
      "textColour": typeof this.textColour,
      "disappear": typeof this.disappear,
      "transDist": typeof this.transDist,
      "transDuration": typeof this.transDuration,
      "transFunction": typeof this.transFunction,
      "textTransform": typeof this.textTransform
    }
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
  init(instant = false) {
    // Initialise the progress bar
    if (!instant) {
      this.setProgress(1.0);
      this.hideText();
    }
    this._draw();
    if (!instant) {
      let jsph = this;
      setTimeout(function () {
        jsph.reset();
        if (jsph.displayText) jsph.showText();
      }, 500);
    }
    return this;
  }
  
  setProperty(property, value) {
    // Set a single property or a range of properties
    if (typeof property === "string") {
      
      if (Object.keys(this.settable).indexOf(property) == -1) {
        throw new Error("Property '" + property + "' not settable!");
      } else if (typeof value != this.settable[property]) {
        throw new TypeError("Expected type '" + this.settable[property] + 
                            "', not '" + typeof value + "'");
      } else {
        this[property] = value;
      }
      
    } else if (property.constructor === Array && value.constructor === Array) {
      
      let inSettable = property.map(a => Object.keys(this.settable).indexOf(a));
      if (inSettable.some(v => v < 0)) {
        let errprops = property[this._getAllIndices(inSettable, -1)];
        throw new Error("Prop(s) '" + errprops.toString() + "' not settable!");
      } else {
        var typeErrs = []
        for (var i = 0; i < property.length; i++) {
          if (typeof value[i] != this.settable[property[i]]) {
            typeErrs.push(new TypeError(
              "Property: '" + property[i] + "', Expected type '" + 
              this.settable[property[i]] + "', not '" + typeof value + "'"
            ));
          }
        }
        if (typeErrs.length == 1) {
          throw typeErrs[0];
        } else if (typeErrs.length > 1) {
          typeErrs.map(a => {console.log(a)});
          throw new TypeError("Type errors found - see console.");
        } else {
          for (var i = 0; i < property.length; i++) {
            this[property[i]] = value[i];
          }
        }
      }
      
    } else if (property.constructor === Object) {
      
      let k = Object.keys(property);
      let inSettable = k.map(a => Object.keys(this.settable).indexOf(a));
      if (inSettable.some(v => v < 0)) {
        let errprops = k[this._getAllIndices(inSettable, -1)];
        throw new Error("Prop(s) '" + errprops.toString() + "' not settable!");
      } else {
        var typeErrs = []
        for (var key in property) {
          if (typeof property[key] != this.settable[key]) {
            typeErrs.push(new TypeError(
              "Property: '" + key + "', Expected type '" + 
              this.settable[key] + "', not '" + typeof property[key] + "'"
            ));
          }
        }
        if (typeErrs.length == 1) {
          throw typeErrs[0];
        } else if (typeErrs.length > 1) {
          typeErrs.map(a => {console.log(a)});
          throw new TypeError("Type errors found - see console.");
        } else {
          for (var key in property) {
            this[key] = property[key];
          }
        }
      }
      
    }
    this.angles = this._createAngles(this.n);
    this._calcCircs();
    this.josephusInd = this._calcJosephus();
    this._createTextElement();
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
    clearInterval(this.timer);
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
    clearInterval(this.timer);
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
    textElem.setAttributeNS(null, "dominant-baseline", "central");
    // IE/Edge fix for lack of support for dominant-baseline property :'(
    if (this._detectIE() != false) {
      textElem.setAttributeNS(null, "dy", "0.35em"); // approximation
    }
    
    textElem.setAttributeNS(null,"font-size", this.fontSize);
    textElem.setAttributeNS(null,"font-family", this.fontFamily);
    textElem.setAttributeNS(null, "fill", this.textColour);
    
    textElem.style.opacity = this.textOpacity;
    textElem.style.transitionProperty = "all";
    textElem.style.transitionDuration = this.transDuration;
    textElem.style.transitionTimingFunction = this.transFunction;
    textElem.style.transform = this.textTransform;
    
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
  
  _getAllIndices(arr, val) {
    let idx = [];
    for(var i = 0; i < arr.length; i++){
      if (arr[i] === val) idx.push(i);
    }
    return idx;
  }

  _detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  }
  
}

---
layout: default
title: Documentation
---

<h1> Reference documentation </h1>
<h2> <span id = "version"> <code> v1.0.0 </code> </span> </h2>  
<h2 id="contents"> Contents </h2>
* TOC
{:toc}

---

## Constructor
### `new JSephus`
To instantiate a new class, use the ES6 syntax `new JSephus()`. The constructor has two arguments: 
- `parentsvgId`: the name or DOM element of the parent SVG.
- `n`: the number of circles to draw.

__Usage__

```{javascript}
var jsph = new JSephus("jsph-svg", 41);
```

__See also__

[createSVG](#createsvg), [init](#init), [n](#n)

<br><br>

## Methods
### `init`
__Summary__

Draw a `JSephus` object in the parent SVG element.

__Arguments__

| Argument | Type | Description |
| :------- | :--- | :---------- |
| instant | boolean | Whether to fade-in or instantly show the loader. Default `false`. |

__Usage__

```{javascript}
jsph.init();
```

__Details__

After instantiating a new JSephus object, this function initialises that object: it calculates the position of the circles, creates these elements as well as the text element and appends them to the parent SVG in the DOM. By default, this happens in a 'pretty' way: the elements fade-in in a short amount of time. Setting the argument `instant` to `false` removes this transition and instantly shows the loader.

It is necessary to call `init` after setting properties using the `setProperty` method to show the changes.

__See also__

[createSVG](#createsvg), [setProperty](#setproperty), [setProgress](#setprogress)

<br><br>

### `setProperty`
__Summary__

Styling the loader by changing the display properties of the `JSephus` object. 

__Arguments__

| Argument | Type | Description |
| :------- | :--- | :---------- |
| property | string, array, object | In case of string or array: the name(s) of the properties to change. In this case it also needs a value argument. Otherwise: a JSON object with as keys the names of the properties to set and as values the desired values of these properties. |
| value | value, array, null | Which value to change the corresponding property to. Its type depends on the selected [property](#properties). |

__Usage__

```{javascript}
jsph.setProperty("radius", 15);

jsph.setProperty(["radius", "dist"], [15, 100]);

jsph.setProperty({
  "alpha": 0.1,
  "fontSize": "50",
  "textOpacity": "0.5"
});

// chaining setProperty & init
jsph.setProperty("radius", 15).init();
```

__Details__

This is the workhorse `JSephus` styling method. In order to know which properties can be set, see [Properties](#properties). In case of erroneous input, this function returns informative errors, so don't be afraid to play around!

__See also__

[Properties](#properties), [init](#init), [setProgress](#setprogress)

<br><br>

### `setProgress`
__Summary__

Set the progress value of the loader element. This function updates the loader to the new state.

__Arguments__

| Argument | Type | Description |
| :------- | :--- | :---------- |
| proportion | number | The progress proportion to set the `JSephus` loader at. This number needs to be between 0 and 1. |


__Usage__

```{javascript}
jsph.setProgress(0.5);
```

__See also__

[init](#init), [reset](#reset), [start](#start)

<br><br>


### `reset`
__Summary__

Set the progress value of the loader element to 0. If text is hidden but property `displayText` is `true`, also show the text element.

__Usage__

```{javascript}
jsph.reset();
```

__See also__

[init](#init), [setProgress](#setprogress), [start](#start), [hideText](#hidetext)

<br><br>


### `start`
__Summary__

Animate the progress until 100% in a given amount of time.

__Arguments__

| Argument | Type | Description |
| :------- | :--- | :---------- |
| time | integer | The time in milliseconds that it should take the loader to animate from 0% to 100%. Default `10000` (10 seconds) |
| callback | function | Function to call after the progress has reached 100%. The argument of this function is the JSephus element. |


__Usage__

```{javascript}
// run for 10 seconds
jsph.start();

// run for 5 seconds, hide text after done
jsph.start(5000, jsph => jsph.hideText());
```

__See also__

[init](#init), [reset](#reset), [reverse](#reverse), [hideText](#hidetext)

<br><br>


### `reverse`
__Summary__

Animate the progress down to 0% in a given amount of time.

__Arguments__

| Argument | Type | Description |
| :------- | :--- | :---------- |
| time | integer | The time in milliseconds that it should take the loader to animate from 100% to 0%. Default `10000` (10 seconds) |
| callback | function | Function to call after the progress has reached 0%. The argument of this function is the JSephus element. |


__Usage__

```{javascript}
// run for 10 seconds
jsph.reverse();

// run for 5 seconds, hide text after done
jsph.reverse(5000, jsph => jsph.hideText());
```

__See also__

[init](#init), [reset](#reset), [start](#start), [hideText](#hidetext)

<br><br>


### `stop`
__Summary__

Stops the animation initiated by [start](#start) or [reverse](#reverse).

__Usage__

```{javascript}
jsph.stop();
```

__See also__

[start](#start), [reverse](#reverse), [reset](#reset)

<br><br>




### `hideText`
__Summary__

Hide the text element (by setting its opacity to 0).

__Usage__

```{javascript}
jsph.hideText();
```

__See also__

[showText](#showtext), [reset](#reset), [displayText](#displayText), [textOpacity](#textOpacity), [textColour](#textColour)

<br><br>

### `showText`
__Summary__

Show the text element (by setting its opacity to [textOpacity](#textOpacity)), even when [displayText](#displayText) is set to `false`.

__Usage__

```{javascript}
jsph.showText();
```

__See also__

[showText](#showtext), [reset](#reset), [displayText](#displayText), [textOpacity](#textOpacity), [textColour](#textColour)

<br><br>


## Static methods
Static methods do not require an instance of the JSephus class. They can be called as elements of the class specification: `JSephus.method()`.

### `createSVG`
__Summary__

Creates a proper `SVG` element for `JSephus` and appends it to the window DOM.

__Arguments__

| Argument | Type | Description |
| :------- | :--- | :---------- |
| parentId | string | The parent `<div>` of the `<svg>` |
| svgId | string | The id of the new `<svg>` |
| viewBoxWidth | number | The width of the internal coordinate system |
| viewBoxHeight | number | The height of the internal coordinate system |

__Usage__

```{javascript}
JSephus.createSVG("parentDiv", "jsph-svg", 512, 512);
```

__Details__

JSephus uses the viewBox of the SVG element to calculate the midpoint, distances, translation distances, and radii of its circles. I recommend setting the margins or the padding of the parent div to resize the loading element, not to change any properties of the SVG itself. Of course, if you are an SVG pro, feel free to play around with viewBoxes and such.

__See also__

[init](#init), [setProperty](#setproperty), [dist](#dist), [radius](#radius), [transDist](#transDist) 

<br><br>

## Properties

These are the properties that can be changed through the [setProperty](#setproperty) method.

| Name | type | description |
| :--- | :--- | :---------- |
| <span id="n">n</span> | integer | The number of circles in the loading element. No default (set by the [constructor](#new-jsephus)). |
| <span id="colour">colour</span> | boolean | Whether the elements have colour or grayscale. Default `true`. |
| <span id="alpha">alpha</span> | number | Number between 0 and 1 that indicates the opacity of the circles. 0 indicates fully transparent. Default `1`. |
| <span id="dist">dist</span> | number | Distance of the circles from the midpoint, expressed in terms of svg coordinate units set by the viewBox in the [constructor](#constructor). Default 2/3rds the shortest distance from the middle to the edge of the box. |
| <span id="radius">radius</span> | number | Radius of the circles themselves. Default `10`. |
| <span id="precision">precision</span> | number | Precision (step size) of the animation started by [start](#start) or [reverse](#reverse). Has to be larger than 0, smaller than 1. Default `0.001`. |
| <span id="displayText">displayText</span> | boolean | Whether to show the animated text in the middle of the loader. Default `true`. Override through [showText](#showtext) or [hideText](#hidetext) possible. |
| <span id="fontSize">fontSize</span> | CSS string | Font size of the text element. This accepts CSS strings so it is possible to use relative units such as "1rem". Default `60`. |
| <span id="fontFamily">fontFamily</span> | CSS string | The font family of the text element. Default `system font` stack. |
| <span id="textOpacity">textOpacity</span> | CSS string | String of a number between 0 and 1 that indicates the opacity of the text element. "0" indicates fully transparent. Default `"1.0"`. |
| <span id="textColour">textColour</span> | CSS string | Colour of the text. Default `"rgb(60, 150, 120)"`. |
| <span id="disappear">disappear</span> | boolean | Whether the circles should disappear when they are "killed". Default `true`. |
| <span id="transDist">transDist</span> | number | How far the circles should travel outward when they are "killed". Default `dist * 1/5`. |
| <span id="transDuration">transDuration</span> | CSS string | String indicating how long it should take a "killed" element to move and / or disappear. Default `"0.4s"`|
| <span id="transFunction">transFunction</span> | CSS string | What should the css transition-timing-function property of the transition be. Default "cubic-bezier(.59, .01, .39, .97)". |
| <span id="textTransform">textTransform</span> | CSS string | CSS string indicating the transform to be applied to the text element. Can be used to properly align text in case the font displays strangely, or simply to move the text to a corner, for example. Default `"translate(0px, 0px)"`. |

<br><br>

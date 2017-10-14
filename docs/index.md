---
layout: default
title: Home
---

# The JSephus loader

Inspired by the [Josephus problem](https://www.youtube.com/watch?v=uCsD3ZGzMgE), the `JSephus` loader is a visually attractive way of attending users to progress of a process. It's a `.js` file containing a single `ES6` class designed to be simple to use, enabling you to _drop in_ the loader anywhere you have an `SVG` element ready.

```{javascript}
var jsph = new JSephus("svgElementId", 40);
jsph.init();
```

---

<div class="btnGroup">
  <button onclick="j1strt()"> Start </button>
  <button onclick="j1stop()"> Stop </button>
  <button onclick="j1rset()"> Reset </button>
</div>

<div style="max-width:70%;margin-left:auto;margin-right:auto;"> 
  <svg id="jsph1" viewBox="0 0 512 512"> </svg> 
</div>

<script type="text/javascript">
  var j1 = new JSephus("jsph1", 40);
  j1.init();
  var j1strt = function() { window.j1.start();  };
  var j1stop = function() { window.j1.stop() };
  var j1rset = function() { window.j1.reset() };
</script>
---

The `JSephus` loader is very customisable. Setting some different properties is easy:

```{javascript}
jsph.setProperty({
  "dist": 90, 
  "displayText": false, 
  "radius": 30,
  "alpha": 0.3, 
  "disappear": false, 
  "transDist": 90
}).init();
```

And the result will look very different:

---

<div class="btnGroup">
  <button onclick="j2strt()"> Start </button>
  <button onclick="j2stop()"> Stop </button>
  <button onclick="j2rset()"> Reset </button>
</div>

<div style="max-width:70%;margin-left:auto;margin-right:auto;"> 
  <svg id="jsph2" viewBox="0 0 512 512"> </svg> 
</div>

<script type="text/javascript">
  var j2 = new JSephus("jsph2", 40);
  j2.setProperty(["dist", "displayText", "radius", "alpha", "disappear", "transDist"], [90, false, 30, 0.3, false, 90]).init();
  var j2strt = function() { window.j2.start();  };
  var j2stop = function() { window.j2.stop() };
  var j2rset = function() { window.j2.reset() };
</script>
---

If you want to see all the stuff the `JSephus` loader can do, visit the [documentation page](docpage) or the [quick-start guide](quickstart). Enjoy!

<br><br>

## Issues, suggestions, questions
If you have questions, suggestions, or problems, please report them on [GitHub](https://github.com/vankesteren/JSephus/issues).

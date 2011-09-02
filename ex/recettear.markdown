---
layout: ex
title: Recettear Item Data
---

# Item Data

<ul class="characters clearfix">
<li class="selected">
  <a id="Anyone" class="Anyone" href="#Anyone" title="Anyone" onclick="by_character(event)">Anyone</a>
</li>
</ul>
<div id="chart" style="margin-left: -160px;"> </div>
<div class="items clearfix"> </div>
<ul class="dungeons clearfix"> </ul>

<link type="text/css" rel="stylesheet" href="recettear/styles.css"/>
<link type="text/css" rel="stylesheet" href="bubble.css"/>
<script src="../d3.layout.js?2.0.3"> </script>
<script src="../d3.geom.js?2.0.3"> </script>
<script src="recettear/data.js"> </script>
<script src='recettear/items.js'> </script>

<div id="credits">
Layout inspired by <a href="http://mbostock.github.com/d3/ex/force.html">Mike Bostock</a>.
Data from <a href="http://www.carpefulgur.com/recettear/">Recettear</a> v1.108 (English).
Wiki item links courtesy of <a href="http://recettear.wikia.com/wiki/">Wikia</a>.
</div>

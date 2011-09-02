var style  = document.createElement('style')
  , head   = document.head || document.getElementsByTagName('head')[0]
  , css    = ''
  , r      = 960
  , vis    = d3.select('#chart').append('svg:svg')
      .attr('width', r)
      .attr('height', r)
      .attr('class', 'bubble')
  , _slice = Array.prototype.slice
  , C, I, D // character, item and dungeon visualizations respectively

//  , w     = 960
//  , h     = 500
//  , fill  = d3.scale.category20()
//  , vis = d3.select("#chart")
//    .append("svg:svg")
//      .attr("width", w)
//      .attr("height", h)
//
  ;


// <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" width="32" height="32"><image width="32" height="32" xlink:href=""/></svg>

//<image width="32" height="32" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACdUlEQVRYCcVXzY4BQRAum30DJ0cn8QriQryChODiEVwcuOEpHBwlJA7ubkQ8gbgQkXByde2dr6N6p3une4yd2a1kdM90dX1fVfVPSQkh6D/l4z/Bgf35VwSGw6EKdb/fTylcpCDpZzAYiOv16sEIsd1uBd49kbhvR8DvkfLm2dE8fH7LZDI0n88pnU7T4XBQU1JgElUAnsvlpDFz7v1+1wBOpxNls1mpVqlU6HK5ULfbpePxKNPgjIDNS4AXi0WCVza53W7a0Pl8luDL5VL7biUAcC+UBEOY/Hg85MR8Pq+AMbbf78n02o8AsovFgna7nfrM3uODlQAGkbNqtYquIrFer+U78ohns9nId/OnVCpRo9Gg8XhM0+n0e9Ubik4C0DVJTCYTDdTvDdsejUai3W5Tp9Nxgkt93g5mi62yWq3EbDaTjzcums2m8BYUutati9RBarUaGqsej4WehNg2kFarJT0P8lgqeD/wvNfrUb1eD/ecJzETs+XDA1FIwnPGCwwRwBF6CNq4w87gaH8QYHA+OvHuIhA1535w9APXAPKOQwb73H9sctq4fSvnPJlbkxE8Rt4haG3e/9Zzxg2MAJPDCRcksXj+NOwkEBT+OMHBwUnA9D5ucCuBoNAnAS4d5MXgb7EQIbwF41pwfgzuh6YAtxoulkjHq5k7x7uVABcUuFJfutUcIK6hQAIooyAoJsLuc5fxV8a0egC5xiTv8JFzUcm4iolXAMJ0VAQAXigUCIUjBGWYv4wKM/TuuCIAA+VyWRaOXL2+azTKPI0AFh7XgGb1GsVoFF3tfwHS4C80XdVPFBCXrkbApZjUmJaCpEBcdr8AgwuQfcs5TIQAAAAASUVORK5CYII="/>

// url : array of item indices with that image
d3.json('recettear/itemimages.json', init);

function init(item_urls) {
  var items_pane = d3.select('.items')
    , items_node = items_pane.node()
    , max_height
    , defs       = vis.append('svg:defs')
    , i = 0
    ;

  for (var url in item_urls) item_urls[url].forEach(function(idx) {
    var item = items[idx], id;
    item.value = sum_stats(item);
    item.img_id = id = 'i' + i++;
    item.is_item = 1;
    defs.append('svg:image')
        .attr('id', id)
        .attr('width', 1)
        .attr('height', 1)
        .attr('xlink:href', url);
  });

  // sort characters by sex, to make some item usage distribution more intuitive
  characters.sort(function by_sex(a, b) {
    var A = Number(a.id.slice(2)), B = Number(b.id.slice(2));
    return (((A & 1) << 3) + A) - (((B & 1) << 3) + B);
  });

  dungeons.forEach(function (d) {
    var dx = (d.id - 1) * -128 + 4;
    css += '.du'+ d.id +' { background-position: '+ dx +'px 0px; }\n';
    d.is_dungeon = true;
  });
  style.innerHTML = css;
  head.appendChild(style);

  // for character selection (and showing users of items)
  C = d3.select('ul.characters')
  .selectAll('li.character').data(characters)
  .enter().append('li') // "anyone" is in the document already
    .attr('class', 'character')
    .append('a')
     .text(_name)
     .attr('id', _name) // permalinks
     .attr('class', _id) // (styling)
     .attr('title', _name)
     .attr('onclick', 'by_character(event)')
     .attr('href', function(c) { return '#'+ c.name; });

  bubbles();
  I = d3.select('#chart').selectAll('.item');

/*
  // the main items pane
  I = items_pane.selectAll('.item').data(items).enter().append('a')
    .attr('class', 'item')
    .attr('href', wiki_url)
    .attr('id', _item_id)
    .attr('title', _name);

  // add item image icon
  I.append('img').attr('width', 32).attr('height', 32).attr('src', _image);

  // make items findable via Ctrl/Cmd-F (centering titles below)
  I.append('label')
    .text(_name)
    .attr('for', _item_id)
    .style('margin-left', function() {
      return - (this.offsetWidth >> 1) +'px';
    });
*/

  // the dungeon selector
  D = d3.select('ul.dungeons')
    .selectAll('li.dungeon').data(dungeons)
    .enter().append('li')
      .attr('class', function(d) { return 'dungeon du'+ d.id; });

  // make chested items findable by dungeon (and set dungeon expectations)
  D.append('a')
    .text(_name)
    .attr('id', _name)
    .attr('title', _name)
    .attr('onclick', 'by_dungeon(event)')
    .attr('href', function(d) { return '#'+ d.name; });

  max_height = window.innerHeight - y_pos(items_node) - 8;

  // 64 = item badge height, 120 = dungeon icon height
  items_node.style.height = (max_height - max_height % 64 - 120) + 'px';
  document.body.addEventListener('mousemove', show_item, false);
  document.body.addEventListener('DOMFocusIn', show_item, false);

  by_character((location.hash || '').slice(1));
}

function bubbles() {
  var format = d3.format(",d")
    , fill = d3.scale.category20c()
    ;

  var bubble = d3.layout.pack().sort(null).size([r, r]);

  var node = vis.selectAll('g.node')
        .data(bubble.nodes({ children: items.filter(pluck('value')) }))
      .enter().append('svg:g')
        .attr('class', 'node item')
        .attr('transform', function(d) {
          return 'translate('+ d.x +','+ d.y +')';
        });

    //node.append('svg:title')
    //    .text(function(d) { return d.name; });

    node.append('svg:circle')
        .attr('class', 'item')
        .attr('r', function(d) { return d.r; })
        .style('fill', function(d) { return fill(d.type); });

    node.append('svg:use')
        .attr('class', 'item')
        .attr('xlink:href', function(d) { return '#'+ d.img_id; })
        .attr('transform', function(d) {
                             var dx = Math.sqrt(d.r * d.r / 2)
                               , sz = 'scale('+ (2 * dx) +')';
                             return 'translate(-'+ dx +',-'+ dx +') '+ sz;
                           })
        .append('svg:title')
          .text(function(d) { return d.name +': '+ d.value +' total stats'; });

    //node.append('svg:text')
    //    .attr('text-anchor', 'middle')
    //    .attr('dy', '.3em')
    //    .text(function(d) { return d.className.substring(0, d.r / 3); });
}

function imageURL(img, x, y, w, h) {
  var canvas = document.createElement('canvas'), ctx;
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
  return canvas.toDataURL('image/png');
}

function show_item(e) {
  function is_user(ch) {
    if (!item || !item.chars) return false;
    return -1 !== item.chars.indexOf(ch.name);
  }
  var at = e.target, item = at.__data__;
  if (item && !item.is_item) item = false;
  C.classed('user', is_user);

  // if we're hovering the dungeon panel, don't touch it
  if (!item || item.is_dungeon) return;
  D.classed('chest', function(d) {
    return item && is_in_dungeon(d.id, item);
  });
}

function y_pos(node) {
  var pn = node.offsetParent || 0;
  return node.offsetTop + (pn && y_pos(pn));
}

function _id(c)    { return c.id; }
function _name(c)  { return c.name; }
function _image(i) { return i.image; }
function pluck(n) { return function(x) { return x && x[n]; }; }
function array(a, n) { return _slice.call(a, n||0); }
function partial(fn) {
  var args = array(arguments, 1);
  return function() { return fn.apply(this, args.concat(array(arguments))); };
}
function _item_id(i) { return 'i'+ i.id; }
function wiki_url(item) {
  var name = (
      { "Assassin Blade": "Assassin's Blade"
      })[item.name] || item.name;
  return 'http://recettear.wikia.com/wiki/' + name.replace(/ /g, '_');
}

function sum_stats(i) {
  return i.atk + i.def + i.mag + i.mdef;
}

function by_dungeon(e) {
  var name = 'object' === typeof e ? e.target.id : e
    , x    = window.pageXOffset
    , y    = window.pageYOffset
    , id, d, i, min, max;
  for (i = 0; d = dungeons[i]; i++)
    if (d.name === name) {
      id = d.id;
      break;
    }
  if (!id) return;
  min = 10 * id;
  max = 10 + min;
  by_character('Anyone'); // reset character view

  D.classed('selected', 0).classed('chest', 0);
  d3.select(document.getElementById(name).parentNode).classed('selected', 1);

  I.transition().duration(250)
    .style('opacity', function(item) {
      return item.is_item ? is_in_dungeon(id, item) ? 1 : 0.25 : 1;
    });
}

function is_in_dungeon(no, item) {
  function exists(min_level) {
    return min <= min_level && min_level < max;
  }
  var min = no * 10, max = 10 + min;
  return item && (item.where.chest || []).filter(exists).length;
}

function by_character(e) {
  var name = 'object' === typeof e ? e.target.id : e
    , any  = 'Anyone' === name
    , x    = window.pageXOffset
    , y    = window.pageYOffset
    , id, c, i;
  for (i = 0; c = characters[i]; i++)
    if (c.name === name) {
      id = c.id;
      break;
    }
  if (!id && !any) return;
  //console.info(name);

  D.classed('chest', 0).classed('selected', 0);
  d3.select('.characters li.selected').classed('selected', 0);
  d3.select(document.getElementById(name).parentNode).classed('selected', 1);

  I.transition()
      .duration(250)
      .style('opacity', function(d, i) {
        if (d && d.is_item && !any && -1 === (d.chars || []).indexOf(name)) {
          return 0.25;
        }
        return 1;
      })
  ;

  // don't change on-screen scroll position when clicked
  setTimeout(function() { window.scrollTo(x, y); }, 0);
}

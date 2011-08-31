var style  = document.createElement('style')
  , head   = document.head || document.getElementsByTagName('head')[0]
  , css    = ''
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

load(init);

function init() {
  var items_pane = d3.select('.items')
    , items_node = items_pane.node()
    , max_height
    ;

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

  // the main items pane
  I = items_pane.selectAll('.item').data(items).enter().append('a')
    .attr('class', 'item')
    .attr('href', wiki_url)
    .attr('id', _item_id)
    .attr('title', _name);

  // the dungeon selector
  D = d3.select('ul.dungeons')
    .selectAll('li.dungeon').data(dungeons)
    .enter().append('li')
      .attr('class', function(d) { return 'dungeon du'+ d.id; });

  // add item image icon
  I.append('img').attr('src', _image);

  // make items findable via Ctrl/Cmd-F (centering titles below)
  I.append('label')
    .text(_name)
    .attr('for', _item_id)
    .style('margin-left', function() {
      return - (this.offsetWidth >> 1) +'px';
    });

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

function load(cb) {
  function cut(e) {
    var img = this
      , cat = categories[images.indexOf(img)];
    items.forEach(function(item) {
      var cid = item.id.slice(0, 2);
      if (cid !== cat.id) return;
      item.is_item = true;
      var iid = Number(item.id.slice(2))
        , row = iid >> 3, h = 32, y = h * row
        , col = iid % 8,  w = 32, x = w * col;
      item.image = imageURL(img, x, y, w, h);
    });
    if (!--left) cb();
  }
  var images = [], left, img, i, cat;

  for (left = 0; cat = categories[left]; left++) {
    images.push(img = new Image);
    img.onload = cut;
    img.src = 'recettear/gfx/items/item' + cat.id + '.gif';
  }

  dungeons.forEach(function (d) {
    var dx = (d.id - 1) * -128 + 4;
    css += '.du'+ d.id +' { background-position: '+ dx +'px 0px; }\n';
  });
  style.innerHTML = css;
  head.appendChild(style);
}

function imageURL(img, x, y, w, h) {
  var canvas = document.createElement('canvas'), ctx;
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
  return canvas.toDataURL("image/png");
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
  if (/dungeon/.test(at && at.getAttribute('onclick') || '')) return;
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
      return is_in_dungeon(id, item) ? 1 : 0.25;
    });
}

function is_in_dungeon(no, item) {
  function exists(min_level) {
    return min <= min_level && min_level < max;
  }
  var min = no * 10, max = 10 + min;
  return (item.where.chest || []).filter(exists).length;
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

  d3.select('.items')
    .selectAll('.item')
    .transition()
      .duration(250)
      .style('opacity', function(d, i) {
        if (!any && -1 === (d.chars || []).indexOf(name)) {
          return 0.25;
        }
        return 1;
      })
  ;

  // don't change on-screen scroll position when clicked
  setTimeout(function() { window.scrollTo(x, y); }, 0);
}

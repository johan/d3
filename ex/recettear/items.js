var style = document.createElement('style')
  , head  = document.head || document.getElementsByTagName('head')[0]
  , css   = ''
  , iids  = {}
  ;

categories.forEach(function (cat) {
  css += '.ty'+ cat.id +' { background-image: url("recettear/gfx/items/item'
       + cat.id +'.gif"); }\n';
});
dungeons.forEach(function (d) {
  var dx = (d.id - 1) * -128 + 4;
  css += '.du'+ d.id +' { background-position: '+ dx +'px 0px; }\n';
});
items.forEach(function (item) {
  var iid = item.id.slice(2);
  iids[iid] = Number(iid);
  item.is_item = true;
});
for (var iid in iids) {
  var c = iid % 8, r = iid >> 3
    , x = -32 * c, y = -32 * r;
  css += '.it'+ iid +' { background-position: '+ x +'px '+ y +'px; }\n';
}
style.innerHTML = css;
head.appendChild(style);

var w = 960,
    h = 500,
    fill = d3.scale.category20();

var vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// for character selection (and showing users of items)
var C = d3.select('ul.characters')
  .selectAll('li.character').data(characters)
  .enter().append('li') // "anyone" is in the document already
    .attr('class', 'character')
    .append('a')
     .text(_name)
     .attr('id', _name) // permalinks
     .attr('class', _id) // (styling)
     .attr('title', _name)
     .attr('onclick', 'by_character(event)')
     .attr('href', function(c) { return '#'+ c.name; })

  , _slice = Array.prototype.slice
  , pane = d3.select('.items')
  , pdiv = pane.node()
  , maxh = window.innerHeight - y_pos(pdiv) - 8
  , I = pane.selectAll('.item').data(items).enter().append('a')
    .attr('class', 'item')
    .attr('href', wiki_url)
    .attr('id', _item_id)
    .attr('title', _name)
  , D = d3.select('ul.dungeons')
          .selectAll('li.dungeon').data(dungeons)
          .enter().append('li')
            .attr('class', function(d) { return 'dungeon du'+ d.id; })
  ;

  // add item image (sprited) icon
  I.append('div')
    .attr('class', function(i) {
      var id = i.id.match(/\d\d/g);
      return 'icon ty'+ id[0] +' it'+ id[1];
    });

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

// 64 = item badge height, 120 = dungeon icon height
pdiv.style.height = (maxh - maxh % 64 - 120) + 'px';
document.body.addEventListener('mousemove', show_item, false);
document.body.addEventListener('DOMFocusIn', show_item, false);

by_character((location.hash || '').slice(1));

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

function _id(c)   { return c.id; }
function _name(c) { return c.name; }
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

var style = document.createElement('style')
  , head  = document.head || document.getElementsByTagName('head')[0]
  , css   = '.item {\n'
          + '  float: left; margin: 0 2px 7px; display: block;\n'
          + '  width: 32px; height: 32px; padding: 12px 15px 12px 14px;\n'
          + '  background: url("recettear/gfx/misc/badge.png") no-repeat;\n'
          + '  color:transparent; text-indent: -10em; text-decoration: none;\n'
          + '}\n'
          + '.item .icon {\n'
          + '  width: 32px; height: 32px;\n'
          + '}\n'
  , iids  = {}
  ;

categories.forEach(function (cat) {
  css += '.ty'+ cat.id +' { background-image: url("recettear/gfx/items/item'
       + cat.id +'.gif"); }\n';
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
var chars = d3.select('ul.characters')
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

  , pane = d3.select('.items')
  , pdiv = pane.node()
  , maxh = window.innerHeight - y_pos(pdiv) - 8
  , I = pane.selectAll('.item').data(items).enter().append('a')
    .attr('class', 'item')
    .attr('href', wiki_url)
    .attr('title', _name)
    .append('div')
      .attr('class', function(i) {
         var id = i.id.match(/\d\d/g);
         return 'icon ty'+ id[0] +' it'+ id[1];
       })
  ;

// 64 = item badge height
pdiv.style.height = (maxh - maxh % 64) + 'px';
document.body.addEventListener('mousemove', show_users, false);

by_character((location.hash || '').slice(1));

function show_users(e) {
  function is_user(ch) {
    if (!item || !item.chars) return false;
    return -1 !== item.chars.indexOf(ch.name);
  }
  var item = e.target.__data__;
  if (item && !item.is_item) item = false;
  chars.classed('user', is_user);
}

function y_pos(node) {
  var pn = node.offsetParent || 0;
  return node.offsetTop + (pn && y_pos(pn));
}

function _id(c)   { return c.id; }
function _name(c) { return c.name; }
function wiki_url(item) {
  var name = (
      { "Assassin Blade": "Assassin's Blade"
      })[item.name] || item.name;
  return 'http://recettear.wikia.com/wiki/' + name.replace(/ /g, '_');
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

  d3.select('li.selected').classed('selected', 0);
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

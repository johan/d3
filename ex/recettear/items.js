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

// character selection
d3.select('ul.characters')
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
  ;

d3.select('.items')
  .selectAll('.item').data(items)
  .enter().append('a')
    .attr('class', 'item')
    .attr('href', wiki_url)
    .attr('title', _name)
    .append('div')
      .attr('class', function(i) {
         var id = i.id.match(/\d\d/g);
         return 'icon ty'+ id[0] +' it'+ id[1];
       })
  ;

by_character((location.hash || '').slice(1));

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
}

if (0)
d3.json("../miserables.json", function(json) {
  var force = d3.layout.force()
      .charge(-60)
      .nodes(json.nodes)
      .links(json.links)
      .size([w, h])
      .start();

  var link = vis.selectAll("line.link")
      .data(json.links)
    .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  var node = vis.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 5)
      .style("fill", function(d) { return fill(d.group); })
      .call(force.drag);

  node.append("svg:title")
      .text(function(d) { return d.name; });

  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});

function pluck(x) { return function(d) { return d[x]; }; }

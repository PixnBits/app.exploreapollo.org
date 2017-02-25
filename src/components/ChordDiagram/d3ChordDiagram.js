import * as d3 from "d3";
import curry from "lodash/curry";

export default curry(function d3ChordDiagram(data, node) {

  //FIXME revert to dynamic data after demo!!
  var matrix = [
  [  7.,   1.,   5.,   0.,   1.,   0.],
  [  0.,   4.,   3.,   0.,   0.,   0.],
  [  6.,   2.,  17.,   1.,   1.,   1.],
  [  0.,   0.,   1.,   0.,   0.,   0.],
  [  2.,   0.,   0.,   0.,   3.,   0.],
  [  0.,   0.,   1.,   0.,   0.,   4.]];

  // Returns the Flare package name for the given class name.
  // function name(name) {
  //   return name.substring(0, name.lastIndexOf(".")).substring(6);
  // }
  //
  // Compute a unique index for each package name.
  // data.forEach(function(d) {
  //   if (!indexByName.has(d = name(d.name))) {
  //     nameByIndex.set(n, d);
  //     indexByName.set(d, n++);
  //   }
  // });
  //
  // // Construct a square matrix counting package imports.
  // data.forEach(function(d) {
  //   var source = indexByName.get(name(d.name)),
  //     row = matrix[source];
  //   if (!row) {
  //     row = matrix[source] = [];
  //     for (var i = -1; ++i < n;) row[i] = 0;
  //   }
  //   d.imports.forEach(function(d) {
  //     row[indexByName.get(name(d))]++;
  //   });
  // });

  //FIXME should be the innerwidth of the tab container, not the entire window
  var width = window.innerWidth / 2;
  var height = width;
  var innerRadius = Math.min(width, height) * 0.35;
  var outerRadius = innerRadius * 1.1;
  var formatValue = d3.formatPrefix(",.0", 1e3);
  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  var chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

  var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  var ribbon = d3.ribbon()
    .radius(innerRadius);

  var svg = d3.select(node)
    .attr("id", "visual")
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMinYMid")
    .attr("viewBox", "0 0 " + width + " " + height);

  //FIXME janky positioning fix with '((width / 2) - 40)'
  var g = svg.append("g")
    .attr("transform", "translate(" + ((width / 2) - 40) + "," + (height / 2) + ")")
    .datum(chord(matrix));


  var group = g.append("g")
    .attr("class", "groups")
    .selectAll("g")
    .data(function(chords) {return chords.groups;})
    .enter().append("g")
    .style("fill", function(d) {return color(d.index);});

  group.append("path")
    .style("fill", function(d) {return color(d.index);})
    .style("stroke", function(d) {return d3.rgb(color(d.index)).darker();})
    .attr("d", arc)
    .on("mouseover", fade(0.05))
    .on("mouseout", fade(1));

  var groupTick = group.selectAll(".group-tick")
    .data(function(d) {return groupTicks(d, 1e3);})
    .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) {return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)";});

  groupTick.append("line")
    .attr("x2", 6);

  //FIXME add text from the matrix to the ticks
  groupTick.filter(function(d) {return d.value % 5e3 === 0;})
    .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) {return d.angle > Math.PI ? "rotate(180) translate(-16)" : null;})
      .style("text-anchor", function(d) {return d.angle > Math.PI ? "end" : null;})
      .text(function(d) {return formatValue(d.value);});

  g.append("g")
    .attr("class", "ribbons")
    .selectAll("path")
    .data(function(chords) {return chords;})
    .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function(d) {return color(d.target.index);})
      .style("stroke", function(d) {return d3.rgb(color(d.target.index)).darker();})
      .style("opacity", 0.9)
      .on("mouseover", fadeChord(0.05, 0.05))
      .on("mouseout", fadeChord(1, 0.9));

  // Returns an array of tick angles and values for a given group and step.
  function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function(value) {
      return {
        value: value,
        angle: value * k + d.startAngle + (d.endAngle - d.startAngle) / 2
      };
    });
  }

  function fade(opacity) {
    return function(g, i) {
      svg.selectAll(".chord path")
        .filter(function(d) {
          return d.source.index != i && d.target.index != i;
        })
        .transition()
        .style("opacity", opacity);
    };
  }

  function fadeChord(opacityArcs, opacityChords) {
    return function(g, i) {
      svg.selectAll(".chord path")
        .filter(function(d,j) { return j!=i; })
      .transition()
        .style("opacity", opacityChords);
      svg.selectAll(".arc path")
        .filter(function(d) { return !(d.index == g.source.index || d.index == g.target.index); })
      .transition()
        .style("opacity", opacityArcs);
    };
  }

  function resize() {
    var targetWidth = window.innerWidth / 2;
    var svg = d3.select("#visual");
    svg.attr("width", targetWidth);
    svg.attr("height", targetWidth / (width / height));
  }
  window.onresize = resize;
});

//d3.select(self.frameElement).style("height", outerRadius * 2 + "px");

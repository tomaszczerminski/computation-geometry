/** TODO: How do I remove duplicates from here and perf? */
var createRandom = require('ngraph.random');
var seed = +new Date();
var prng = createRandom(seed);

export * from './brownian';

export function random(count = 4, range = 100, seed) {
  seed = 1536687392180
  if (seed !== undefined) {
    prng = createRandom(seed);
  }
  var lines = [];
  for (var i = 0; i < count; ++i) {
    lines.push({
      from: {x: (prng.nextDouble() - 0.5) * range, y: (prng.nextDouble() - 0.5) * range},
      to: {x: (prng.nextDouble() - 0.5) * range, y: (prng.nextDouble() - 0.5) * range}
    });
  }
  return lines;
}

export function parallelSlanted(count) {
  var lines = [];
  for (var i = 0; i < count; ++i) {
    var x = -i, y = i;
    lines.push({
      from: {x, y},
      to: {x: i, y: i + i}
    })
  }
  return lines;
}

export function sparse(size = 50) {
  var lines = [];
  var rows = size, columns = size;
  for (var j = 0; j < rows; ++j) {
    for (var i = 0; i < columns; ++i) {
      var x = i * 10, y = j * 10;
      var a = prng.gaussian();

      lines.push({
        from: {x, y},
        to: {x: x + 10 * Math.cos(a), y: y + 10 * Math.sin(a)}
      });
    }
  }
  return lines;
}

export function triangle(count = 4, variance = 10) {
  var lines = [];
  var step = 5;
  var idxVar = prng.nextDouble() < 0.5 ? 1 : 0;
  for (var i = 0; i < count; ++i) {
    for (var j = 0; j < count; ++j) {
      var x = step * i;
      var y = step * j;

      var idxToUse = (i % 2 === idxVar) ? i : j;
      var angle =  Math.PI * (idxToUse/count - prng.gaussian());
      drawTriangle(x, y, variance, angle);
    }
  }

  return lines;

  function drawTriangle(x, y, width, alpha) {
    var cp = {x: x + width/2, y: y - width/2};
    var left = rotate({x: x, y: y}, cp, alpha);
    var right = rotate({x: x + width, y: y}, cp, alpha);
    var middle = rotate({x: x + width/2, y: y - width}, cp, alpha);

    lines.push(
      {from: {x: left.x, y: left.y}, to: {x: right.x, y: right.y}, name: `B${x},${y}`},
      {from: {x: right.x, y: right.y}, to: {x: middle.x, y: middle.y}, name: `U${x},${y}`},
      {from: {x: middle.x, y: middle.y}, to: {x: left.x, y: left.y}, name: `D${x},${y}`}
    )
  }
}

function rotate(point, center, alpha) {
  point.x -= center.x;
  point.y -= center.y;

  var x = Math.cos(alpha) * point.x - point.y * Math.sin(alpha) + center.x;
  var y = Math.sin(alpha) * point.x + point.y * Math.cos(alpha) + center.y;
  return {x, y};
}

export function cube(count = 4, variance = 10) {
  var forwardAngle = 0;
  var r = 4;
  var dAngle = Math.PI/count;

  var lines = [];
  for (var i = 0; i < count; ++i) {
    forwardAngle += dAngle + prng.gaussian() * variance;
    addRect(forwardAngle, r);
    r += prng.gaussian() * variance;
  }
  return lines;

  function addRect(angle, r) {
    var x = Math.cos(angle) * r;
    var y = Math.sin(angle) * r;

    lines.push({
        from: {x: x, y: y},
        to: {x: -y, y: x},
      },
      {
        from: {x: -y, y: x},
        to: {x: -x, y: -y}
      },
      {
        from: {x: -x, y: -y},
        to: {x: y, y: -x}
      },
      {
        from: {x: y, y: -x},
        to: {x: x, y: y}
      }
    );
  }
}

export function grid(vertical = 10, horizontal = 10) {
  var lines = [];
  var dx = 0; var dy = -0.3;
  for (var i = 0; i < vertical; i += 1) {
    lines.push({
      name: 'h' + i,
      from: {x: dx, y: i + dy},
      to: {x: dx + (horizontal - 1), y: i + dy}
    });
  }

  for (i = 0; i < horizontal; i += 1) {
    lines.push({
      name: 'v' + i,
      from: {x: dx + i, y: dy},
      to: {x: dx + i, y: (vertical - 1) + dy}
    });
  }
  return lines;
}

export function drunkgrid(size = 10, variance = 10) {
  var lines = [];
  var dx = -2 * variance; var dy = -2 * variance;
  for (var i = 0; i < size; i += 1) {
    lines.push({
      name: 'h' + i,
      from: {x: dx + prng.gaussian() * variance, y: i + dy + prng.gaussian() * variance},
      to: {x: dx + (size - 1) + prng.gaussian() * variance, y: i + dy + prng.gaussian() * variance}
    });
    lines.push({
      name: 'v' + i,
      from: {x: dx + i + prng.gaussian() * variance, y: dy + prng.gaussian() * variance},
      to: {x: dx + i + prng.gaussian() * variance, y: (size - 1) + dy + prng.gaussian() * variance}
    });
  }

  return lines;
}

export function complete(count = 10, range = 100) {
  var angleStep = 2 * Math.PI / count;
  var lines = [];
  var seen = new Set();

  for (var i = 0; i < count; ++i) {
    var angle = angleStep * i;
    var x = Math.cos(angle) * range / 2;
    var y = Math.sin(angle) * range / 2;
    for (var j = 0; j < count; ++j) {
      if (j !== i) {
        var ex = Math.cos(angleStep * j) * range / 2;
        var ey = Math.sin(angleStep * j) * range / 2;
        var name = `${i},${j}`;
        var l = {
          name: name,
          from: {x: x, y: y},
          to: {x: ex, y: ey}
        };
        var sKey = getKey(i, j);
        if (!seen.has(sKey)) {
          lines.push(l);
          seen.add(sKey)
        }
      }
    }
  }

  return lines;

  function getKey(i, j) {
    return i < j ? i + ';' + j : j + ';' + i;
  }
}

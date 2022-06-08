# Computation Geometry project powered by [isect](https://github.com/anvaka/isect)

[Try it online](https://jazzy-douhua-4ec3ba.netlify.app/?isAsync=true&p0=98&p1=9&algorithm=sweep&generator=drunkgrid&stepsPerFrame=1)

# Algorithms

The project implements three algorithms

## Bentley-Ottmann sweep line algorithm

This algorithm has `O(n*log(n) + k*log(n))` performance, where `n` is number of
segments, and `k` is number of intersections.

This method is preferred when you have large number of lines, and not too many
intersections (`k = o(n^2/log(n))`, to be more specific). 

The algorithm follows "Computation Geometry, Algorithms and Applications" book
by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars. It does support
degenerate cases, though read limitations to learn more.

## Brute force algorithm

This is "naive" implementation where each segment is compared with all other segments,
and thus has O(n*n) performance.

Despite its naiveté, it works much faster than Bentley-Ottmann algorithm for the cases
when there are a few thousand lines and millions of intersections. This scenario is
common in force-based graph drawing, where "hairball" is formed by a few thousand lines.

## "Bush" algorithm

The algorithm uses [mourner/flatbush](https://github.com/mourner/flatbush) as a spatial
index of segments, and then iterates over every segment, checking overlapping bounding boxes.

Intuitively, worst case performance of this algorithm is comparable with brute force. When every segment
overlaps with every other segment we should expect `O(n^2)` operations. In practice, however, this 
algorithm beats both `Bentley-Ottman` and `Brute force` approaches.

Its beauty is in its simplicity. It adapts very well to both sparse and dense segments distribution.

You can also find performance test suite below, so you can decide for yourself. I would absolutely go with
this algorithm as my default choice.

## Performance 

The benchmark code is [available here](https://github.com/anvaka/isect/blob/master/perf/index.js). Higher ops per second is better!

### K12 graph

* Sweep: Circular lines 12x40 x 1,069 ops/sec ±1.98% (91 runs sampled)
* **Brute: Circular lines 12x40 x 7,463 ops/sec ±3.01% (76 runs sampled)**
* Bush: Circular lines 12x40 x 5,678 ops/sec ±2.20% (80 runs sampled)

The graph has only `66` unique segments, and `313` unique
intersections. Brute force algorithm is 7x faster than Sweep Line, closely followed by


### 100 random lines

In this demo 100 lines are randomly sampled inside a box with a side of 42px.

* Sweep: 100 Random lines lines in 42px box x 277 ops/sec ±1.20% (87 runs sampled)
* **Brute: 100 Random lines lines in 42px box x 3,606 ops/sec ±3.61% (74 runs sampled)**
* Bush: 100 Random lines in 42px box x 3,314 ops/sec ±2.66% (83 runs sampled)

Again, the brute force algorithm wins. The distance between brute force and 
Bush shortens. Sweep line comes last.

### Sparse intersections

* Sweep: 2,500 sparse lines x 156 ops/sec ±0.97% (80 runs sampled)
* Brute: 2,500 sparse lines x 13.62 ops/sec ±0.91% (38 runs sampled)
* **Bush: 2,500 sparse lines x 592 ops/sec ±1.05% (93 runs sampled)**

Now Bush algorithm wins by huge margin. Bentley-Ottman comes second, and brute
force comes the last.

### Parallel Slanted lines

* **Sweep: 1000 slanted, not intersect x 622 ops/sec ±1.23% (91 runs sampled)**
* Brute: 1000 slanted, not intersect x 230 ops/sec ±2.37% (87 runs sampled)
* Bush: 1000 slanted, not intersect x 243 ops/sec ±1.07% (87 runs sampled)

In this example there too many lines, and none of them intersect. Furthermore, most of the
rectangular bounding boxes do intersect, which gives more work for the `bush` algorithm

## Downloading intersections

It is possible to download intersection set in CSV format for further processing. 
Report will be ready to download as soon as intersections are calculated.

## How to use an API

The program can be controlled via HTTP query. There are a few that may come handy.

`algoritm` - one can choose between `sweep`, `brute` and `bush` values (detailed description for each of them above),  
`generator` - is used to determine how the segments are generated. Supported values: `complete`, `cube`, `drunkgrid`, `sparse`, `triangle`, `splash`

If `algorithm` is equal to `sweep` then step-by-step sweeping animation is displayed and its speed may be controlled by tweaking `stepsPerFrame` query parameter

## Development

### Project setup
```
cd app && npm install
```

### Compiles and hot-reloads for development
```
cd app && npm start
```

### Compiles and minifies for production
```
cd app && npm run build
```

### Lints and fixes files
```
cd app && npm run lint
```


## Limitations

The sweep line algorithm is susceptible to floating point rounding errors. It is
possible to construct an example, with nearly horizontal lines, that would
cause it to fail.

While sweep line implementation detects `point-segment` overlap, I didn't implement `point-point`
overlap. I.e. identical points in the input array that do not overlap any segment
are not reported.

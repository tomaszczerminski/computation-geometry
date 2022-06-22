# Computation Geometry project

[Try it online](https://jazzy-douhua-4ec3ba.netlify.app)

# Algorithms

The project implements sweep plane algorithm

## Sweep line algorithm

This algorithm has `O(n*log(n) + k*log(n))` performance, where `n` is number of
segments, and `k` is number of intersections.

This method is preferred when you have large number of lines, and not too many
intersections (`k = o(n^2/log(n))`, to be more specific). 

The algorithm follows "Computation Geometry, Algorithms and Applications" book
by Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars. It does support
degenerate cases, though read limitations to learn more.

## Downloading intersections

It is possible to download intersection set in CSV format for further processing. 
Report will be ready to download as soon as intersections are calculated.

## How to use an API

The program can be controlled via HTTP query. There are a few that may come handy.

`generator` - is used to determine how the segments are generated. Supported values: `complete`, `cube`, `drunkgrid`, `sparse`, `triangle`, `splash`

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

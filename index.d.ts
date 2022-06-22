export type Point = {
  x: number,
  y: number
}

export type Segment = {
  from: Point,
  to: Point
}

export type Results = {
  run: Function,
  step: Function
}

export type Options = {
}

export default function intersections(segments: Array<Segment>, options: Options) : Results;

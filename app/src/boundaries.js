export default class Boundaries {

  constructor() {
    this.minX = Number.POSITIVE_INFINITY;
    this.minY = Number.POSITIVE_INFINITY;
    this.maxX = Number.NEGATIVE_INFINITY;
    this.maxY = Number.NEGATIVE_INFINITY;
  }

  get left() {
    return this.minX;
  }

  get top() {
    return this.minY;
  }

  get right() {
    return this.maxX;
  }

  get width() {
    return this.maxX - this.minX;
  }

  get height() {
    return this.maxY - this.minY;
  }

  addPoint(xIn, yIn) {
    if (xIn === undefined) throw new Error('Point is not defined');
    let x = xIn;
    let y = yIn;
    if (y === undefined) {
      x = xIn.x;
      y = xIn.y;
    }

    if (x < this.minX) this.minX = x;
    if (x > this.maxX) this.maxX = x;
    if (y < this.minY) this.minY = y;
    if (y > this.maxY) this.maxY = y;
  }

  merge(otherBBox) {
    if (otherBBox.minX < this.minX) this.minX = otherBBox.minX;
    if (otherBBox.minY < this.minY) this.minY = otherBBox.minY;
    if (otherBBox.maxX > this.maxX) this.maxX = otherBBox.maxX;
    if (otherBBox.maxY > this.maxY) this.maxY = otherBBox.maxY;
  }
}

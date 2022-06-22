export default class SweepEvent {
  constructor(point, segment) {
    this.point = point;
    if (segment) this.from = [segment];
  }
}

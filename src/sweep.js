import queue from './event-queue';
import createSweepStatus from './sweep-status';
import SweepEvent from './sweep-event';

import {intersectSegments, EPS, angle, samePoint} from './geom';

const EMPTY = [];

export default function isect(segments, options) {
  const results = [];
  const reportIntersection = (options && options.onFound) || defaultIntersectionReporter;
  const onError = (options && options.onError) || defaultErrorReporter;
  const eventQueue = queue(byY);
  const status = createSweepStatus(onError, EPS);
  let lower, interior, lastPoint;
  segments.forEach(addSegment);
  return {
    run,
    step,
    addSegment,
    eventQueue,
    sweepStatus: status,
    results
  }

  function run() {
    while (!eventQueue.isEmpty()) {
      const eventPoint = eventQueue.pop();
      if (handleEventPoint(eventPoint)) {
        return;
      }
    }
    return results;
  }

  function step() {
    if (!eventQueue.isEmpty()) {
      const eventPoint = eventQueue.pop();
      handleEventPoint(eventPoint);
      return true;
    }
    return false;
  }

  function handleEventPoint(p) {
    lastPoint = p.point;
    const upper = p.from || EMPTY;
    lower = interior = undefined;
    status.findSegmentsWithPoint(lastPoint, addLowerOrInterior);
    if (!lower) lower = EMPTY;
    if (!interior) interior = EMPTY;
    const uLength = upper.length;
    const iLength = interior.length;
    const lLength = lower.length;
    const hasIntersection = uLength + iLength + lLength > 1;
    const hasPointIntersection = !hasIntersection && (uLength === 0 && lLength === 0 && iLength > 0);
    if (hasIntersection || hasPointIntersection) {
      p.isReported = true;
      if (reportIntersection(lastPoint, union(interior, union(lower, upper)))) {
        return true;
      }
    }
    status.deleteSegments(lower, interior, lastPoint);
    status.insertSegments(interior, upper, lastPoint);
    let sLeft, sRight;
    const hasNoCrossing = (uLength + iLength === 0);
    if (hasNoCrossing) {
      const leftRight = status.getLeftRightPoint(lastPoint);
      sLeft = leftRight.left;
      if (!sLeft) return;
      sRight = leftRight.right;
      if (!sRight) return;
      findNewEvent(sLeft, sRight, p);
    } else {
      const boundarySegments = status.getBoundarySegments(upper, interior);
      findNewEvent(boundarySegments.beforeLeft, boundarySegments.left, p);
      findNewEvent(boundarySegments.right, boundarySegments.afterRight, p);
    }
    return false;
  }

  function addLowerOrInterior(s) {
    if (samePoint(s.to, lastPoint)) {
      if (!lower) lower = [s];
      else lower.push(s);
    } else if (!samePoint(s.from, lastPoint)) {
      if (!interior) interior = [s];
      else interior.push(s);
    }
  }

  function findNewEvent(left, right, p) {
    if (!left || !right) return;
    const intersection = intersectSegments(left, right);
    if (!intersection) {
        return;
    }
    const dy = p.point.y - intersection.y;
    if (dy < -EPS) {
      return;
    }
    if (Math.abs(dy) < EPS && intersection.x <= p.point.x) {
      return;
    }
    roundNearZero(intersection);
    const current = eventQueue.find(intersection);
    if (current && current.isReported) {
      onError('event already reported');
      return;
    }
    if (!current) {
      const event = new SweepEvent(intersection);
      eventQueue.insert(event);
    }
  }

  function defaultIntersectionReporter(p, segments) {
    results.push({
      point: p, 
      segments: segments
    });
  }

  function addSegment(segment) {
    let event;
    let from = segment.from;
    let to = segment.to;
    roundNearZero(from);
    roundNearZero(to);
    const dy = from.y - to.y;
    if (Math.abs(dy) < 1e-5) {
      from.y = to.y;
      segment.dy = 0;
    }
    if ((from.y < to.y) || (
        (from.y === to.y) && (from.x > to.x))
      ) {
      const temp = from;
      from = segment.from = to; 
      to = segment.to = temp;
    }
    segment.dy = from.y - to.y;
    segment.dx = from.x - to.x;
    segment.angle = angle(segment.dy, segment.dx);
    const isPoint = segment.dy === segment.dx && segment.dy === 0;
    const prev = eventQueue.find(from);
    if (prev && !isPoint) {
      const prevFrom = prev.data.from;
      if (prevFrom) {
        for (let i = 0; i < prevFrom.length; ++i) {
          const s = prevFrom[i];
          if (samePoint(s.to, to)) {
            reportIntersection(s.from, [s.from, s.to]);
            reportIntersection(s.to, [s.from, s.to]);
            return;
          }
        }
      }
    }
    if (!isPoint) {
      if (prev) {
        if (prev.data.from) prev.data.from.push(segment);
        else prev.data.from = [segment];
      } else {
        const e = new SweepEvent(from, segment);
        eventQueue.insert(e);
      }
      event = new SweepEvent(to);
      eventQueue.insert(event)
    } else {
      event = new SweepEvent(to);
      eventQueue.insert(event)
    }
  } 
}

function roundNearZero(point) {
  if (Math.abs(point.x) < EPS) point.x = 0;
  if (Math.abs(point.y) < EPS) point.y = 0;
}

function defaultErrorReporter(errorMessage) {
  throw new Error(errorMessage);
}

function union(a, b) {
  if (!a) return b;
  if (!b) return a;

  return a.concat(b);
}

function byY(a, b) {
  let res = b.y - a.y;
  if (Math.abs(res) < EPS) {
    res = a.x - b.x;
    if (Math.abs(res) < EPS) res = 0;
  }
  return res;
}

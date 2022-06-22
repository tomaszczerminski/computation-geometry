import SplayTree from 'splaytree';
import {samePoint, getIntersectionXPoint} from './geom'

export default function createSweepStatus(onError, EPS) {
    let lastPointY, prevY;
    let lastPointX, prevX;
    let useBelow = false;
    const status = new SplayTree(compareSegments);
    const currentBoundary = {
        beforeLeft: null,
        left: null,
        right: null,
        afterRight: null,
    };
    const currentLeftRight = {left: null, right: null};
    return {
        insertSegments,
        deleteSegments,
        getLeftRightPoint,
        getBoundarySegments,
        findSegmentsWithPoint,
        status,
        getLastPoint() {
            return {x: lastPointX, y: lastPointY};
        }
    }

    function compareSegments(a, b) {
        if (a === b) return 0;
        const ak = getIntersectionXPoint(a, lastPointX, lastPointY);
        const bk = getIntersectionXPoint(b, lastPointX, lastPointY);
        const res = ak - bk;
        if (Math.abs(res) >= EPS) {
            return res;
        }
        const aIsHorizontal = Math.abs(a.dy) < EPS;
        const bIsHorizontal = Math.abs(b.dy) < EPS;
        if (aIsHorizontal && bIsHorizontal) {
            return b.to.x - a.to.x;
        }
        if (aIsHorizontal) {
            return useBelow ? -1 : 1;
        }
        if (bIsHorizontal) {
            if (useBelow) {
                return (b.from.x >= lastPointX) ? -1 : 1
            }
            return -1;
        }
        const pa = a.angle;
        const pb = b.angle;
        if (Math.abs(pa - pb) >= EPS) {
            return useBelow ? pa - pb : pb - pa;
        }
        let segDist = a.from.y - b.from.y;
        if (Math.abs(segDist) >= EPS) {
            return -segDist;
        }
        segDist = a.to.y - b.to.y;
        if (Math.abs(segDist) >= EPS) {
            return -segDist;
        }
        return 0;
    }

    function getBoundarySegments(upper, interior) {
        let cmp;
        let s;
        let leftMost, rightMost, i;
        const uLength = upper.length;
        if (uLength > 0) {
            leftMost = rightMost = upper[0];
        } else {
            leftMost = rightMost = interior[0];
        }
        for (i = 1; i < uLength; ++i) {
            s = upper[i];
            cmp = compareSegments(leftMost, s);
            if (cmp > 0) leftMost = s;
            cmp = compareSegments(rightMost, s);
            if (cmp < 0) rightMost = s;
        }
        const startFrom = uLength > 0 ? 0 : 1;
        for (i = startFrom; i < interior.length; ++i) {
            s = interior[i];
            cmp = compareSegments(leftMost, s);
            if (cmp > 0) leftMost = s;
            cmp = compareSegments(rightMost, s);
            if (cmp < 0) rightMost = s;
        }
        const left = status.find(leftMost);
        if (!left) {
            onError('left could not have been found');
        }
        const right = status.find(rightMost);
        if (!right) {
            onError('right could not have been found');
        }
        const beforeLeft = left && status.prev(left);
        let afterRight = right && status.next(right);
        while (afterRight && right.key.dy === 0 && afterRight.key.dy === 0) {
            afterRight = status.next(afterRight);
        }
        currentBoundary.beforeLeft = beforeLeft && beforeLeft.key;
        currentBoundary.left = left && left.key;
        currentBoundary.right = right && right.key;
        currentBoundary.afterRight = afterRight && afterRight.key;
        return currentBoundary;
    }

    function getLeftRightPoint(p) {
        let lastLeft;
        let current = status._root;
        let minX = Number.POSITIVE_INFINITY;
        let useNext = false;
        while (current) {
            const x = getIntersectionXPoint(current.key, p.x, p.y);
            const dx = p.x - x;
            if (dx >= 0) {
                if (dx < minX) {
                    minX = dx;
                    lastLeft = current;
                    current = current.left;
                    useNext = false;
                } else {
                    break;
                }
            } else {
                if (-dx < minX) {
                    useNext = true;
                    minX = -dx;
                    lastLeft = current;
                    current = current.right;
                } else {
                    break;
                }
            }
        }
        if (useNext) {
        }
        currentLeftRight.left = lastLeft && lastLeft.key
        const next = lastLeft && status.next(lastLeft);
        currentLeftRight.right = next && next.key
        return currentLeftRight;
    }

    function findSegmentsWithPoint(p, onFound) {
        let current = status._root;
        while (current) {
            const x = getIntersectionXPoint(current.key, p.x, p.y);
            const dx = p.x - x;
            if (Math.abs(dx) < EPS) {
                collectAdjacentNodes(current, p, onFound);
                break;
            } else if (dx < 0) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
    }

    function collectAdjacentNodes(root, p, onFound) {
        onFound(root.key);
        goOverPredecessors(root.left, p, onFound);
        goOverSuccessors(root.right, p, onFound);
    }

    function goOverPredecessors(root, p, res) {
        if (!root) return;
        const x = getIntersectionXPoint(root.key, p.x, p.y);
        const dx = p.x - x;
        if (Math.abs(dx) < EPS) {
            collectAdjacentNodes(root, p, res);
        } else {
            goOverPredecessors(root.right, p, res);
        }
    }

    function goOverSuccessors(root, p, res) {
        if (!root) return;
        const x = getIntersectionXPoint(root.key, p.x, p.y);
        const dx = p.x - x;
        if (Math.abs(dx) < EPS) {
            collectAdjacentNodes(root, p, res);
        } else {
            goOverSuccessors(root.left, p, res);
        }
    }

    function insertSegments(interior, upper, sweepLinePos) {
        let i;
        lastPointY = sweepLinePos.y;
        lastPointX = sweepLinePos.x;
        let key;
        for (i = 0; i < interior.length; ++i) {
            key = interior[i];
            status.add(key);
        }
        for (i = 0; i < upper.length; ++i) {
            key = upper[i]
            status.add(key);
        }
    }

    function deleteSegments(lower, interior, sweepLinePos) {
        let i;
        const prevCount = status._size;
        prevX = lastPointX;
        prevY = lastPointY;
        lastPointY = sweepLinePos.y;
        lastPointX = sweepLinePos.x;
        useBelow = true;
        for (i = 0; i < lower.length; ++i) {
            removeSegment(lower[i], sweepLinePos)
        }
        for (i = 0; i < interior.length; ++i) {
            removeSegment(interior[i], sweepLinePos)
        }
        useBelow = false;
        if (status._size !== prevCount - interior.length - lower.length) {
            onError('segments could not have been removed');
        }
    }

    function removeSegment(key, sweepLinePos) {
        if (status.find(key)) {
            status.remove(key);
        } else {
            lastPointX = prevX;
            lastPointY = prevY;
            if (status.find(key)) {
                status.remove(key);
            }
            lastPointY = sweepLinePos.y;
            lastPointX = sweepLinePos.x;
        }
    }
}

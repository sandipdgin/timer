class Camera {
  constructor(dMin, dMax, lMin, lMax) {
    this.dMin = dMin;
    this.dMax = dMax;
    this.lMin = lMin;
    this.lMax = lMax;
  }
}

class SegmentTree {
  constructor(coords) {
    this.coords = coords;
    this.n = coords.length - 1;
    this.count = new Array(this.n * 4).fill(0);
    this.covered = new Array(this.n * 4).fill(0);
  }

  updateRange(l, r, delta) {
    this._update(1, 0, this.n, l, r, delta);
  }

  _update(node, start, end, l, r, delta) {
    if (r <= start || end <= l) return;

    if (l <= start && end <= r) {
      this.count[node] += delta;
    } else {
      const mid = (start + end) >> 1;
      this._update(node * 2, start, mid, l, r, delta);
      this._update(node * 2 + 1, mid, end, l, r, delta);
    }

    this._recalculate(node, start, end);
  }

  _recalculate(node, start, end) {
    if (this.count[node] > 0) {
      this.covered[node] = this.coords[end] - this.coords[start];
    } else if (start + 1 === end) {
      this.covered[node] = 0;
    } else {
      this.covered[node] =
        this.covered[node * 2] + this.covered[node * 2 + 1];
    }
  }

  getCoveredLength() {
    return this.covered[1];
  }
}

function buildEventsAndCoords(target, cameras) {
  const events = [];
  const lightCoords = new Set([target.lMin, target.lMax]);

  for (const cam of cameras) {
    if (!isRelevant(cam, target)) continue;

    const dStart = Math.max(cam.dMin, target.dMin);
    const dEnd = Math.min(cam.dMax, target.dMax);

    const lStart = Math.max(cam.lMin, target.lMin);
    const lEnd = Math.min(cam.lMax, target.lMax);

    events.push({ x: dStart, type: 1, lStart, lEnd });
    events.push({ x: dEnd, type: -1, lStart, lEnd });

    lightCoords.add(lStart);
    lightCoords.add(lEnd);
  }

  return { events, lightCoords };
}

function isRelevant(cam, target) {
  return !(
    cam.dMax < target.dMin ||
    cam.dMin > target.dMax ||
    cam.lMax < target.lMin ||
    cam.lMin > target.lMax
  );
}

function compressCoordinates(coordSet) {
  const sorted = Array.from(coordSet).sort((a, b) => a - b);
  const indexMap = new Map();

  sorted.forEach((val, idx) => indexMap.set(val, idx));

  return { sorted, indexMap };
}

function sortEvents(events) {
  events.sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return b.type - a.type; // start before end
  });
}

function applyEvent(segTree, event, indexMap) {
  const l = indexMap.get(event.lStart);
  const r = indexMap.get(event.lEnd);
  segTree.updateRange(l, r, event.type);
}

function isFullyCovered(segTree, requiredLength) {
  return segTree.getCoveredLength() >= requiredLength;
}

function canCoverSegmentTree(target, cameras) {
  const { events, lightCoords } = buildEventsAndCoords(target, cameras);

  if (events.length === 0) return false;

  const { sorted, indexMap } = compressCoordinates(lightCoords);

  sortEvents(events);

  const segTree = new SegmentTree(sorted);
  const requiredLight = target.lMax - target.lMin;

  let prevX = null;

  for (const event of events) {
    const currX = event.x;

    if (prevX !== null && currX > prevX) {
      if (!isFullyCovered(segTree, requiredLight)) {
        return false;
      }
    }

    applyEvent(segTree, event, indexMap);
    prevX = currX;
  }

  return isFullyCovered(segTree, requiredLight);
}

/* Example usage */

// const target = { dMin: 0, dMax: 100, lMin: 0, lMax: 100 };

// const cameras = [
//   new Camera(0, 50, 0, 100),
//   new Camera(50, 100, 0, 100)
// ];

// console.log(canCoverSegmentTree(target, cameras)); // true

// const camerasWithGap = [
//   new Camera(0, 50, 0, 40),
//   new Camera(0, 50, 60, 100),
//   new Camera(50, 100, 0, 100)
// ];

// console.log(canCoverSegmentTree(target, camerasWithGap)); // false
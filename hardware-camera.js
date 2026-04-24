class Camera {
  constructor(dMin, dMax, lMin, lMax) {
    this.dMin = dMin;
    this.dMax = dMax;
    this.lMin = lMin;
    this.lMax = lMax;
  }
}

function canCoverSweep(target, cameras) {
  if (!cameras || cameras.length === 0) return false;

  const events = [];

  for (const cam of cameras) {
    if (
      cam.dMax < target.dMin ||
      cam.dMin > target.dMax ||
      cam.lMax < target.lMin ||
      cam.lMin > target.lMax
    ) continue;

    const start = Math.max(cam.dMin, target.dMin);
    const end = Math.min(cam.dMax, target.dMax);

    events.push({ x: start, type: 'start', cam });
    events.push({ x: end, type: 'end', cam });
  }

  if (events.length === 0) return false;

  events.sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.type === 'start' ? -1 : 1; // start before end
  });

  const active = new Set();
  let prevX = null;

  for (const event of events) {
    const currX = event.x;

    if (prevX !== null && currX > prevX) {
      if (!isLightCovered(active, target.lMin, target.lMax)) {
        return false;
      }
    }

    if (event.type === 'start') {
      active.add(event.cam);
    } else {
      active.delete(event.cam);
    }

    prevX = currX;
  }

  if (!isLightCovered(active, target.lMin, target.lMax)) {
    return false;
  }

  return true;
}


function isLightCovered(activeCameras, lMin, lMax) {
  if (activeCameras.size === 0) return false;

  const intervals = [];

  for (const cam of activeCameras) {
    intervals.push([
      Math.max(cam.lMin, lMin),
      Math.min(cam.lMax, lMax)
    ]);
  }

  intervals.sort((a, b) => a[0] - b[0]);

  let currentEnd = lMin;

  for (const [start, end] of intervals) {
    if (start > currentEnd) {
      return false; // gap
    }
    currentEnd = Math.max(currentEnd, end);
    if (currentEnd >= lMax) return true;
  }

  return currentEnd >= lMax;
}

/* Example usage */

// const target = { dMin: 0, dMax: 100, lMin: 0, lMax: 100 };

// const cameras = [
//   new Camera(0, 50, 0, 100),
//   new Camera(50, 100, 0, 100)
// ];

// console.log(canCoverSweep(target, cameras)); 


// const camerasWithGap = [
//   new Camera(0, 50, 0, 40),
//   new Camera(0, 50, 60, 100),
//   new Camera(50, 100, 0, 100)
// ];

// console.log(canCoverSweep(target, camerasWithGap)); 
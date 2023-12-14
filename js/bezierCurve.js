export const drawDashedCurve = (m1, m2, map) => {
  const lineLength = google.maps.geometry.spherical.computeDistanceBetween(
    m1,
    m2
  );
  const lineHeading = google.maps.geometry.spherical.computeHeading(m1, m2);
  const { lineHeading1, lineHeading2 } = calculateLineHeadings(lineHeading);
  const pA = google.maps.geometry.spherical.computeOffset(
    m1,
    lineLength / 6.2,
    lineHeading1
  );
  const pB = google.maps.geometry.spherical.computeOffset(
    m2,
    lineLength / 6.2,
    lineHeading2
  );

  const points = calculateBezierPoints(m1, pA, pB, m2);
  const path = createPathFromPoints(points);

  return path;
  // this.curvedLine.setPath(path);
  // this.curvedLine.setMap(this.map);
};

// calculateLineHeadings(lineHeading) {
//   let lineHeading1, lineHeading2;
//   if (lineHeading > 160 || lineHeading <= -160) {
//     lineHeading1 = lineHeading > 160 ? lineHeading - 20 : lineHeading + 10;
//     lineHeading2 = lineHeading > 160 ? lineHeading - 150 : lineHeading + 170;
//   } else if (lineHeading > 0) {
//     lineHeading1 = lineHeading - 15;
//     lineHeading2 = lineHeading - 145;
//   } else {
//     lineHeading1 = lineHeading + 5;
//     lineHeading2 = lineHeading + 165;
//   }

//   return { lineHeading1, lineHeading2 };
// }

const calculateLineHeadings = (lineHeading) => {
  let lineHeading1, lineHeading2;

  if (lineHeading > 160) {
    lineHeading1 = lineHeading - 25;
    lineHeading2 = lineHeading - 155;
  } else if (lineHeading <= -160) {
    lineHeading1 = lineHeading + 5;
    lineHeading2 = lineHeading + 175;
  } else if (lineHeading > 0 && lineHeading <= 15) {
    lineHeading1 = lineHeading - 10;
    lineHeading2 = lineHeading - 170;
  } else if (lineHeading >= 15 && lineHeading <= 160) {
    lineHeading1 = lineHeading - 25;
    lineHeading2 = lineHeading - 155;
  } else if (lineHeading < 0 && lineHeading >= -15) {
    lineHeading1 = lineHeading + 10;
    lineHeading2 = lineHeading + 170;
  } else if (lineHeading < -15 && lineHeading >= -160) {
    lineHeading1 = lineHeading + 25;
    lineHeading2 = lineHeading + 155;
  }

  return { lineHeading1, lineHeading2 };
};

const calculateBezierPoints = (m1, pA, pB, m2) => {
  const B1 = (t) => t * t * t;
  const B2 = (t) => 3 * t * t * (1 - t);
  const B3 = (t) => 3 * t * (1 - t) * (1 - t);
  const B4 = (t) => (1 - t) * (1 - t) * (1 - t);

  const curveNumPoints = 100;
  const points = [];

  for (let i = 0; i < curveNumPoints; i++) {
    const t = i / (curveNumPoints - 1);
    const lat =
      B1(t) * m1.lat() + B2(t) * pA.lat() + B3(t) * pB.lat() + B4(t) * m2.lat();
    const lng =
      B1(t) * m1.lng() + B2(t) * pA.lng() + B3(t) * pB.lng() + B4(t) * m2.lng();
    points.push(new google.maps.LatLng(lat, lng));
  }

  return points;
};

const createPathFromPoints = (points) => {
  const path = new google.maps.MVCArray();
  points.forEach((point) => {
    path.push(point);
  });

  return path;
};

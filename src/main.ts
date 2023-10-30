import "./style.css";
import "typeface-roboto";
import Konva from "konva";
import { generateRandomWalkWithAvoidance } from "./random_walk";
import { Position } from "./types";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container"></div>
`;

const gradientColor = (value: number) => {
  if (value < 0 || value > 1) {
    throw new Error("Value must be between 0 and 1.");
  }

  const startColor = { r: 255, g: 0, b: 0 }; // Red
  const endColor = { r: 0, g: 0, b: 255 }; // Blue

  // Linear interpolation
  const r = startColor.r + value * (endColor.r - startColor.r);
  const g = startColor.g + value * (endColor.g - startColor.g);
  const b = startColor.b + value * (endColor.b - startColor.b);

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};
const distance = (a: Position, b: Position) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

function cosineSchedule(x: number, epsilon = 0.0015) {
  if (x + epsilon < 0 || x - epsilon > 1) {
    throw new Error(`Input should be between 0 and 1, inclusive. Got ${x}`);
  }
  x = Math.max(0, Math.min(1, x));
  return 0.5 * (1 + Math.cos(Math.PI * (1 - x)));
}
// @ts-ignore
function linearInterpolation(
  startPos: Position,
  endPos: Position,
  numSteps: number,
) {
  const positions = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const x = startPos.x + t * (endPos.x - startPos.x);
    const y = startPos.y + t * (endPos.y - startPos.y);
    positions.push({ x, y });
  }

  return positions;
}
const randomSmoothCurve = (
  startPos: Position,
  endPos: Position,
  numSteps: number,
) => {
  // Random control points
  const control1 = {
    x: Math.random() * (endPos.x - startPos.x) + startPos.x,
    y: Math.random() * (endPos.y - startPos.y) + startPos.y,
  };

  const control2 = {
    x: Math.random() * (endPos.x - startPos.x) + startPos.x,
    y: Math.random() * (endPos.y - startPos.y) + startPos.y,
  };

  // Cubic Bezier formula
  function bezier(p0: number, p1: number, p2: number, p3: number, t: number) {
    const u = 1 - t;
    return (
      Math.pow(u, 3) * p0 +
      3 * Math.pow(u, 2) * t * p1 +
      3 * u * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3
    );
  }

  const positions = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const x = bezier(startPos.x, control1.x, control2.x, endPos.x, t);
    const y = bezier(startPos.y, control1.y, control2.y, endPos.y, t);
    positions.push({ x, y });
  }

  return positions;
};
// @ts-ignore
const randomSmoothCurveEnhanced = (
  startPos: Position,
  endPos: Position,
  numSteps: number,
) => {
  // Function to generate a random control point around a midpoint
  function randomControlPoint(p0: Position, p1: Position) {
    const mid = {
      x: (p0.x + p1.x) / 2,
      y: (p0.y + p1.y) / 2,
    };

    // Define a "radius" of randomness around the midpoint
    const radius = Math.max(Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y)) / 2;

    return {
      x: mid.x + (Math.random() - 0.5) * radius,
      y: mid.y + (Math.random() - 0.5) * radius,
    };
  }

  // Cubic Bezier formula
  function bezier(p0: number, p1: number, p2: number, p3: number, t: number) {
    const u = 1 - t;
    return (
      Math.pow(u, 3) * p0 +
      3 * Math.pow(u, 2) * t * p1 +
      3 * u * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3
    );
  }

  const control1 = randomControlPoint(startPos, endPos);
  const control2 = randomControlPoint(startPos, endPos);

  const positions = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const x = bezier(startPos.x, control1.x, control2.x, endPos.x, t);
    const y = bezier(startPos.y, control1.y, control2.y, endPos.y, t);
    positions.push({ x, y });
  }

  return positions;
};
const generateConfigurations = (
  initialPosition: Position,
  radius: number,
  randomStepSize: number,
  numberOfSteps: number,
  maxDistance: number,
  center: Position,
) => {
  const forwardPositions = generateRandomWalkWithAvoidance(
    initialPosition,
    randomStepSize,
    numberOfSteps,
    center,
    2.5,
  );
  const backwardPositions = randomSmoothCurve(
    forwardPositions.at(-1)!,
    initialPosition,
    numberOfSteps,
  );
  const positions = forwardPositions.concat(backwardPositions);
  const circleConfigurations = positions.map((pos) => ({
    x: pos.x,
    y: pos.y,
    radius: radius,
    fill: gradientColor(
      cosineSchedule(1 - distance(pos, initialPosition) / maxDistance),
    ),
  }));

  return circleConfigurations;
};
const sampleInitialPosition = (center: Position, radius: number) => {
  const angle = Math.random() * 2 * Math.PI;
  const x = center.x + radius * Math.cos(angle);
  const y = center.y + radius * Math.sin(angle);
  return { x, y };
};
window.onload = function () {
  const stage = new Konva.Stage({
    container: "container",
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const blobWidth = stage.width() * 0.3; // 40% of the stage width
  const blobHeight = stage.height() * 0.3; // 40% of the stage height
  const numberOfSteps = 200;
  const randomStepSize = 15;
  const circleRadius = 20;
  const savePointsEvery = 5;
  // const arrow = new Konva.Arrow({
  //   x: stage.width() / 2,
  //   y: stage.height() / 2,
  //   points: [0, 0, 100, 0],
  //   pointerLength: 20,
  //   pointerWidth: 20,
  //   fill: "black",
  //   stroke: "black",
  //   strokeWidth: 4,
  // });

  //stage.add(title);

  const layer = new Konva.Layer();
  stage.add(layer);

  const title = new Konva.Text({
    x: stage.width() / 2 - 100,
    y: stage.height() / 15,
    text: "Forward",
    fontSize: 100,
    fontFamily: "Roboto",
    fill: "orange",
  });
  layer.add(title);
  const blob = new Konva.Line({
    points: [
      // starting from the top-left, then going clockwise
      (stage.width() - blobWidth) / 2,
      (stage.height() - blobHeight) / 3, // top-left point
      (stage.width() + blobWidth) / 2,
      (stage.height() - blobHeight) / 2, // top-right point
      (stage.height() / 5 - blobHeight) / 4, // top-right point
      (stage.width() + blobWidth) / 2,
      (stage.height() + blobHeight) / 3, // bottom-right point
      (stage.width() - blobWidth) / 2,
      (stage.height() + blobHeight) / 2, // bottom-left point
    ],
    tension: 0.8, // Adjust this for the amount of curviness
    fill: "blue",
    closed: true,
  });
  layer.add(blob);

  let initialPosition = sampleInitialPosition(
    { x: stage.width() / 2.3, y: stage.height() / 2 },
    stage.width() / 8,
  );
  const circle = new Konva.Circle({
    x: initialPosition.x,
    y: initialPosition.y,
    radius: circleRadius,
    fill: "blue",
    stroke: "white",
    strokeWidth: 1,
  });
  layer.add(circle);
  const fixedCircles = [] as Konva.Circle[];
  let circleConfigurations = generateConfigurations(
    initialPosition,
    circleRadius,
    randomStepSize,
    numberOfSteps,
    stage.width() / 2,
    { x: stage.width() / 2, y: stage.height() / 2 },
  );

  let frameIndex = 0;
  const anim = new Konva.Animation(() => {
    const currentPos = circleConfigurations[frameIndex];
    circle.x(currentPos.x);
    circle.y(currentPos.y);
    circle.fill(circleConfigurations[frameIndex].fill);
    if (frameIndex % savePointsEvery === 0) {
      const fixedCircle = new Konva.Circle({
        x: currentPos.x,
        y: currentPos.y,
        radius: circleRadius,
        fill: circleConfigurations[frameIndex].fill,
        stroke: "white",
        strokeWidth: 0.5,
      });
      fixedCircles.push(fixedCircle);
      layer.add(fixedCircle);
      // if (fixedCircles.length > numFixedCircles) {
      //   fixedCircles[0].destroy();
      //   fixedCircles.shift();
      // }
    }
    // reorders the circle to the top of the layer
    circle.moveToTop();
    frameIndex++;
    if (frameIndex > circleConfigurations.length / 2) {
      title.text("Backward");
    }
    if (
      (frameIndex >= circleConfigurations.length / 2) &&
      (title.text() === "Forward")
    ) {
      anim.stop();
    }
    if (frameIndex >= circleConfigurations.length) {
      // start destroying the circles, but dont stop the animation until they are all destroyed

      // if (fixedCircles.length === 0) {
      //   anim.stop();
      // }
      initialPosition = sampleInitialPosition(
        { x: stage.width() / 2.3, y: stage.height() / 2 },
        stage.width() / 8,
      );
      circleConfigurations = generateConfigurations(
        initialPosition,
        circleRadius,
        randomStepSize,
        numberOfSteps,
        stage.width() / 2,
        { x: stage.width() / 2, y: stage.height() / 2 },
      );
      frameIndex = 0;
      anim.stop();
    }
  }, layer);
  stage.on("click", () => {
    // pause the animation if it is running, otherwise resume it
    if (frameIndex === 0) {
      while (fixedCircles.length > 0) {
        fixedCircles[0].destroy();
        fixedCircles.shift();
      }
    }
    anim.isRunning() ? anim.stop() : anim.start();
  });
  anim.start();

  layer.draw();
};

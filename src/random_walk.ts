import { Position } from "./types";

const generateRandomWalkWithAvoidance = (
  startPos: Position,
  stepSize: number,
  numSteps: number,
  avoidancePos: Position,
  avoidanceStrength: number, // This determines the strength of avoidance behavior
) => {
  const positions: Position[] = [{ ...startPos }];

  for (let i = 0; i < numSteps; i++) {
    const currentPos = positions[positions.length - 1];

    // Calculate the vector from the avoidance position to the current position
    const dx = currentPos.x - avoidancePos.x;
    const dy = currentPos.y - avoidancePos.y;

    // Normalize and scale by the avoidance strength
    const distance = Math.sqrt(dx * dx + dy * dy);
    const biasX = (dx / distance) * avoidanceStrength;
    const biasY = (dy / distance) * avoidanceStrength;

    const nextPos = {
      x: gaussianRandom(currentPos.x + biasX, stepSize),
      y: gaussianRandom(currentPos.y + biasY, stepSize),
    };

    positions.push(nextPos);
  }

  return positions;
};

// const generateRandomWalk = (
//   startPos: Position,
//   stepSize: number,
//   numSteps: number,
//   avoidanceAngle = Math.PI / 2,
// ) => {
//   const positions = [{ ...startPos }] as Position[];
//
//   let lastAngle = null;
//
//   for (let i = 0; i < numSteps; i++) {
//     const currentPos = positions[positions.length - 1];
//     const nextPos = { ...currentPos };
//
//     let angle;
//     do {
//       // Random angle between 0 and 2π
//       angle = Math.random() * 2 * Math.PI; // + Math.PI / 3;
//     } while (
//       lastAngle !== null &&
//       (angle > lastAngle - avoidanceAngle) &&
//       (angle < lastAngle + avoidanceAngle)
//     );
//
//     lastAngle = angle;
//     nextPos.x += stepSize * Math.cos(angle);
//     nextPos.y += stepSize * Math.sin(angle);
//
//     positions.push(nextPos);
//   }
//
//   return positions;
// };
// @ts-ignore
const boxMullerRandom = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();

  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num;
};

// const generateRandomWalk = (
//   startPos: Position,
//   stepSize: number,
//   numSteps: number,
//   avoidanceAngle = Math.PI * 0.85,
// ) => {
//   const positions = [{ ...startPos }] as Position[];
//
//   let lastAngle = null;
//
//   for (let i = 0; i < numSteps; i++) {
//     const currentPos = positions[positions.length - 1];
//     const nextPos = { ...currentPos };
//
//     let angle;
//     do {
//       // Random angle between 0 and 2π
//       const newAngle = Math.random() * 2 * Math.PI +
//         Math.PI * 2 * Math.random() + Math.PI * 2 * Math.random();
//       if (angle === undefined) {
//         console.log("first angle: ", newAngle);
//       }
//       angle = newAngle;
//     } while (
//       lastAngle !== null &&
//       (angle > (lastAngle - avoidanceAngle)) &&
//       (angle < (lastAngle + avoidanceAngle))
//     );
//
//     lastAngle = angle;
//     nextPos.x += stepSize * Math.cos(angle);
//     nextPos.y += stepSize * Math.sin(angle);
//
//     positions.push(nextPos);
//   }
//
//   return positions;
// };
function gaussianRandom(mu: number, sigma: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num * sigma + mu; // Scale and shift to desired mean and std dev
  return num;
}

const generateRandomWalk = (
  startPos: Position,
  stepSize: number,
  numSteps: number,
) => {
  const positions: Position[] = [{ ...startPos }];

  for (let i = 0; i < numSteps; i++) {
    const currentPos = positions[positions.length - 1];
    const nextPos = {
      x: gaussianRandom(currentPos.x, stepSize),
      y: gaussianRandom(currentPos.y, stepSize),
    };

    positions.push(nextPos);
  }

  return positions;
};

export { generateRandomWalk, generateRandomWalkWithAvoidance };

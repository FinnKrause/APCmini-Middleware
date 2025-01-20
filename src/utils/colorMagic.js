import { Colors } from "../backend/constants.js";

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
  

function colorDistance(color1, color2) {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

function findClosestColor(inputHex) {
  const inputRgb = hexToRgb(inputHex);
  let closestColor = null;
  let smallestDistance = Infinity;

  for (const [name, color] of Object.entries(Colors)) {
    const colorRgb = hexToRgb(color.hex);
    const distance = colorDistance(inputRgb, colorRgb);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestColor = { name, ...color };
    }
  }

  return closestColor;
}

function getColorFromHex(hex) {
  for (const color of Object.values(Colors)) {
    if (color.hex.toLowerCase() === hex.toLowerCase()) {
      return color
    }
  }
}

export {findClosestColor, getColorFromHex}
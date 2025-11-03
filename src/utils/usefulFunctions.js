import { FontMapPT7 } from "./Alphabets.js";

export function compareMaps(map1, map2) {
  if (!(map1 instanceof Map) || !(map2 instanceof Map)) return false;
  if (map1.size !== map2.size) return false;

  for (const [key, value] of map1.entries()) {
    if (!map2.has(key)) return false;
    if (!deepEqual(value, map2.get(key))) return false;
  }

  return true;
}

export function compareSets(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (let elem of setA) {
    if (!setB.has(elem)) return false;
  }
  return true;
}

export function textToColumns(text) {
  let columns = [];

  for (let char of text.toUpperCase()) {
    let glyph = FontMapPT7[char] || FontMapPT7[" "]; // fallback = space

    // determine glyph width (max number of bits used across rows)
    let glyphWidth = Math.max(...glyph.map((r) => r.toString(2).length));

    for (let col = 0; col < glyphWidth; col++) {
      let colBits = [];
      for (let row = 0; row < 7; row++) {
        colBits.push((glyph[row] >> (glyphWidth - 1 - col)) & 1);
      }
      columns.push(colBits);
    }

    // add 1 empty column between chars
    if (char != " ") columns.push([0, 0, 0, 0, 0, 0]);
  }
  return columns;
}

export function coordToIndex(row, col) {
  return row * 8 + col;
}

export function MapToArray(map) {
  let val = [];
  for (const elem of map) {
    val.push(elem);
  }
  return val;
}

export function ArrayToSet(array) {
  let val = new Set();
  for (const elem of array) {
    val.add(elem);
  }
  return val;
}

export function isWhiteTextReadable(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  }
  if (!/^([0-9A-F]{6})$/i.test(hex)) return false;

  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const toLinear = (c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Lwhite = 1;

  const contrast = (Lwhite + 0.05) / (L + 0.05);

  return { decision: contrast >= 3, value: contrast };
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a !== "object") return false;

  if (a instanceof Map && b instanceof Map) {
    return compareMaps(a, b);
  }

  if (a instanceof Set && b instanceof Set) {
    return compareSets(a, b);
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

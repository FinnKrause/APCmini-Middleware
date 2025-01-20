// const Colors = {
//   Off: 0,
//   White: 3,

//   Red: 5, // #FF0000
//   BrightRed: 4, // #FF4C4C

//   Green: 21, // #00FF00
//   BrightGreen: 17, // #54FF00

//   Blue: 45, // #0000FF
//   BrightBlue: 36, // #4CC3FF

//   Magenta: 53, // #FF00FF
//   Orange: 9, // #FF5400
//   Purple: 49, // #874CFF
//   VividPink: 56, // #FF4C87
//   NeonPink: 57, // #FF0054
//   Turquoise: 32, // #4CFFB7

//   BrightCoral: 4, // #FF4C4C

//   Yellow: 13, // #FFFF00
//   BrightYellow: 12, // #FFFF4C

//   VibrantCyan: 37, // #00A9FF
//   Cyan: 119, // #E0FFFF
// }; //19 Elements ohne Off

const Colors = {
  black: { hex: "#000000", velocity: 0 },
  darkGray: { hex: "#1E1E1E", velocity: 1 },
  lightGray: { hex: "#7F7F7F", velocity: 2 },
  white: { hex: "#FFFFFF", velocity: 3 },
  lightRed: { hex: "#FF4C4C", velocity: 4 },
  red: { hex: "#FF0000", velocity: 5 },
  darkRed: { hex: "#590000", velocity: 6 },
  veryDarkRed: { hex: "#190000", velocity: 7 },
  peach: { hex: "#FFBD6C", velocity: 8 },
  orange: { hex: "#FF5400", velocity: 9 },
  darkOrange: { hex: "#591D00", velocity: 10 },
  veryDarkOrange: { hex: "#271B00", velocity: 11 },
  lightYellow: { hex: "#FFFF4C", velocity: 12 },
  yellow: { hex: "#FFFF00", velocity: 13 },
  olive: { hex: "#595900", velocity: 14 },
  darkOlive: { hex: "#191900", velocity: 15 },
  lightGreenYellow: { hex: "#88FF4C", velocity: 16 },
  greenYellow: { hex: "#54FF00", velocity: 17 },
  darkGreenYellow: { hex: "#1D5900", velocity: 18 },
  veryDarkGreenYellow: { hex: "#142B00", velocity: 19 },
  teal: { hex: "#4CFF4C", velocity: 20 },
  green: { hex: "#00FF00", velocity: 21 },
  darkGreen: { hex: "#005900", velocity: 22 },
  veryDarkGreen: { hex: "#001900", velocity: 23 },
  mint: { hex: "#4CFF5E", velocity: 24 },
  brightLime: { hex: "#00FF19", velocity: 25 },
  forestGreen: { hex: "#00590D", velocity: 26 },
  veryDarkForestGreen: { hex: "#001902", velocity: 27 },
  brightAqua: { hex: "#4CFF88", velocity: 28 },
  turquoise: { hex: "#00FF55", velocity: 29 },
  darkTurquoise: { hex: "#00591D", velocity: 30 },
  veryDarkTurquoise: { hex: "#001F12", velocity: 31 },
  cyan: { hex: "#4CFFB7", velocity: 32 },
  brightCyan: { hex: "#00FF99", velocity: 33 },
  darkCyan: { hex: "#005935", velocity: 34 },
  veryDarkCyan: { hex: "#001912", velocity: 35 },
  lightTeal: { hex: "#4CC3FF", velocity: 36 },
  skyBlue: { hex: "#00A9FF", velocity: 37 },
  steelBlue: { hex: "#004152", velocity: 38 },
  veryDarkSteelBlue: { hex: "#001019", velocity: 39 },
  aqua: { hex: "#4C88FF", velocity: 40 },
  brightBlue: { hex: "#0055FF", velocity: 41 },
  darkBlue: { hex: "#001D59", velocity: 42 },
  veryDarkBlue: { hex: "#000819", velocity: 43 },
  lavender: { hex: "#4C4CFF", velocity: 44 },
  blue: { hex: "#0000FF", velocity: 45 },
  indigo: { hex: "#000059", velocity: 46 },
  veryDarkIndigo: { hex: "#000019", velocity: 47 },
  purple: { hex: "#874CFF", velocity: 48 },
  violet: { hex: "#5400FF", velocity: 49 },
  darkViolet: { hex: "#190064", velocity: 50 },
  magenta: { hex: "#FF00FF", velocity: 53 },
  darkMagenta: { hex: "#590059", velocity: 54 },
  veryDarkMagenta: { hex: "#190019", velocity: 55 },
  pinkLavender: { hex: "#FF4C87", velocity: 56 },
  brightPink: { hex: "#FF0054", velocity: 57 },
  deepPink: { hex: "#59001D", velocity: 58 },
  veryDarkPink: { hex: "#220013", velocity: 59 },
  brightRed: { hex: "#FF1500", velocity: 60 },
  orangeBrown: { hex: "#993500", velocity: 61 },
  brown: { hex: "#795100", velocity: 62 },
  darkBlueGray: { hex: "#001D59", velocity: 42 },
  navyBlue: { hex: "#000819", velocity: 43 },
  mediumSlateBlue: { hex: "#4C4CFF", velocity: 44 },
  midnightBlue: { hex: "#000059", velocity: 46 },
  veryDarkBlue: { hex: "#000019", velocity: 47 },
  violetBlue: { hex: "#874CFF", velocity: 48 },
  deepPurple: { hex: "#5400FF", velocity: 49 },
  purpleBlack: { hex: "#0F0030", velocity: 51 },
  hotPink: { hex: "#FF4CFF", velocity: 52 },
  neonPink: { hex: "#FF00FF", velocity: 53 },
  darkMagentaRed: { hex: "#590059", velocity: 54 },
  darkMagenta: { hex: "#190019", velocity: 55 },
  neonMagenta: { hex: "#FF0054", velocity: 57 },
  darkRose: { hex: "#59001D", velocity: 58 },
  chocolateBrown: { hex: "#220013", velocity: 59 },
  neonOrange: { hex: "#FF1500", velocity: 60 },
  burntOrange: { hex: "#993500", velocity: 61 },
  lightBrown: { hex: "#795100", velocity: 62 },
  oliveBrown: { hex: "#436400", velocity: 63 },
  forestGreen: { hex: "#005735", velocity: 65 },
  tealGreen: { hex: "#005747", velocity: 66 },
  brightBlueGreen: { hex: "#000FFF", velocity: 67 },
  slateBlue: { hex: "#00454F", velocity: 68 },
  deepTeal: { hex: "#2500CC", velocity: 69 },
  mutedGray: { hex: "#7F7F7F", velocity: 70 },
  charcoalGray: { hex: "#202020", velocity: 71 },
  neonYellow: { hex: "#BDFF2D", velocity: 73 },
  brightYellowGreen: { hex: "#AFED06", velocity: 74 },
  lime: { hex: "#64FF09", velocity: 75 },
  grassGreen: { hex: "#108B00", velocity: 76 },
  neonLime: { hex: "#108F87", velocity: 77 },
  seaGreen: { hex: "#008F8F", velocity: 78 }
}

const LModes = {
  Brightness10: 0,
  Brightness25: 1,
  Brightness50: 2,
  Brightness65: 3,
  Brightness75: 4,
  Brightness90: 5,
  Brightness100: 6,
  Pulsing1t16: 7,
  Pulsing1t8: 8,
  Pulsing1t4: 9,
  Pulsing1t2: 10,
  Blinking1t24: 11,
  Blinking1t16: 12,
  Blinking1t8: 13,
  Blinking1t4: 14,
  Blinking1t2: 15,
};

const MatrixButtonIdexes = { start: 0, end: 63 };
const SceneLaunchButtonIndexes = { start: 112, end: 119 };
const TrackButtonIndexes = { start: 100, end: 107 };
const BottmonRightButtonIdex = 122;

const defaultOffLook = {color: Colors.black, lmode: LModes.Brightness100}
const defaultOnLook = {color: Colors.red, lmode: LModes.Blinking1t2}

export {
  Colors,
  LModes,
  MatrixButtonIdexes,
  BottmonRightButtonIdex,
  SceneLaunchButtonIndexes,
  TrackButtonIndexes,
  defaultOffLook,
  defaultOnLook
};

// module.exports = {
//   Colors,
//   LModes,
//   MatrixButtonIdexes,
//   BottmonRightButtonIdex,
//   SceneLaunchButtonIndexes,
//   TrackButtonIndexes,
// };

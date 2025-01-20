// const { Colors, LModes, TrackButtonIndexes } = require("./constants.js");
import { Colors, LModes, TrackButtonIndexes }  from "./constants.js";

function gP(color = Colors.aqua, lmode) {
  return { color: color, lmode: lmode };
}

function buildDesiredLooksMap() {
  var desiredLooksMap = new Map();
  const defaultSelectedLook = LModes.Brightness100;
  const defaultInactiveLook = LModes.Brightness10;

  const setRange = (start, end, modes) => {
    for (let i = start; i <= end; i++) desiredLooksMap.set(i, modes);
  };
  const setArray = (array, modes) => {
    for (const i of array) desiredLooksMap.set(i, modes);
  };

  //Pattern creation

  //MOV
  setArray([24, 25, 26, 56, 57, 58], {
    on: gP(Colors.green, defaultSelectedLook),
    off: gP(Colors.greenYellow, defaultInactiveLook),
  });

  // //POS
  // setArray([16, 17, 18, 48, 49, 50], {
  //   on: gP(Colors.brightCyan, LModes.Blinking1t2),
  //   off: gP(Colors.brightCyan, defaultInactiveLook),
  // });

  // //DIM KEY
  // setArray([8, 9, 10, 40, 41, 42], {
  //   on: gP(Colors.yellow, LModes.Pulsing1t2),
  //   off: gP(Colors.lightYellow, defaultInactiveLook),
  // });

  // //SHUT KEY
  // setArray([0, 1, 2, 32, 33, 34], {
  //   on: gP(Colors.white, LModes.Blinking1t16),
  //   off: gP(Colors.white, defaultInactiveLook),
  // });

  // //Track Buttons
  // setRange(TrackButtonIndexes.start, TrackButtonIndexes.end, {
  //   on: gP(Colors.red, LModes.Brightness100),
  //   off: gP(Colors.black, 0),
  // });

  //Alternating Moving Head Dimmer Buttons
  desiredLooksMap.set(4, {
    on: gP(Colors.yellow, LModes.Pulsing1t2),
    off: gP(Colors.lightYellow, defaultInactiveLook),
  });
  desiredLooksMap.set(5, {
    on: gP(Colors.yellow, LModes.Pulsing1t4),
    off: gP(Colors.lightYellow, defaultInactiveLook),
  });
  desiredLooksMap.set(6, {
    on: gP(Colors.yellow, LModes.Pulsing1t8),
    off: gP(Colors.lightYellow, defaultInactiveLook),
  });
  desiredLooksMap.set(7, {
    on: gP(Colors.yellow, LModes.Pulsing1t16),
    off: gP(Colors.lightYellow, defaultInactiveLook),
  });
  // All Shutter
  desiredLooksMap.set(15, {
    on: gP(Colors.white, LModes.Blinking1t16),
    off: gP(Colors.white, defaultInactiveLook),
  });

  //All Color Presets
  desiredLooksMap.set(61, {
    on: gP(Colors.red, defaultSelectedLook),
    off: gP(Colors.red, defaultInactiveLook),
  });
  desiredLooksMap.set(62, {
    on: gP(Colors.green, defaultSelectedLook),
    off: gP(Colors.green, defaultInactiveLook),
  });
  desiredLooksMap.set(63, {
    on: gP(Colors.blue, defaultSelectedLook),
    off: gP(Colors.blue, defaultInactiveLook),
  });
  desiredLooksMap.set(53, {
    on: gP(Colors.purple, defaultSelectedLook),
    off: gP(Colors.purple, LModes.Brightness25),
  });
  desiredLooksMap.set(54, {
    on: gP(Colors.brightBlue, defaultSelectedLook),
    off: gP(Colors.brightBlue, defaultInactiveLook),
  });
  desiredLooksMap.set(55, {
    on: gP(Colors.yellow, defaultSelectedLook),
    off: gP(Colors.yellow, defaultInactiveLook),
  });

  // Schwarze Line durch die Mitte
  //   setArray([3, 11, 19, 27, 35, 43, 51, 59], {
  //     on: gP(Colors.Off, LModes.Brightness10),
  //     off: gP(Colors.Off, LModes.Brightness10),
  //   });

  return desiredLooksMap;
}

// module.exports = buildDesiredLooksMap ;
export default buildDesiredLooksMap;

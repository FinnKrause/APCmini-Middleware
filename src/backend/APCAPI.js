import { sendNote } from "../utils/midiwebapi.js";
import {
  SceneLaunchButtonIndexes,
  TrackButtonIndexes,
  MatrixButtonIdexes,
  LModes,
  Colors,
  BottmonRightButtonIdex,
} from "./constants.js";

// const { sendNote } = require("../utils/midiwebapi.js");
// const {
//   SceneLaunchButtonIndexes,
//   TrackButtonIndexes,
//   MatrixButtonIdexes,
//   LModes,
//   Colors,
//   BottmonRightButtonIdex,
// } = require("./constants.js");


class APCAPI {

  constructor(output, deslook) {
    this.output = output;
    this.activeLook = deslook;
    this.forEach(i => {
      this.setButtonLook(i, "off")
    })
  }

  setButtonLook(nnote, look) {
    if (!this.#isButtonPressValid(nnote)) return;
    if (
      !this.activeLook.has(nnote) ||
      this.activeLook.get(nnote)[look] == undefined
    ) {
      switch (look) {
        case "off":
          // this.changeButton(nnote, Colors.Red, LModes.Brightness10);
          this.offNote(nnote);
          break;
        default:
          this.changeButton(nnote, Colors.red, LModes.Blinking1t16);
          break;
      }

      return;
    }

    const queriedLook = this.activeLook.get(nnote);
    this.changeButton(nnote, queriedLook[look].color, queriedLook[look].lmode);
  }

  changeButton(nnote, color, lmode) {
    if (!this.#isButtonPressValid(nnote)) return;

    if (this.#isMatrixButton(nnote)) {
      sendNote(this.output, nnote, color.velocity, lmode)
      this.#setWebUIButton(nnote, color.hex, lmode)

    } else if (this.#isSCButton(nnote)) {
      sendNote(this.output, nnote, lmode > 6 ? 0x02 : lmode == 0 ? 0x0 : 0x01, 0)
      this.#setWebUIButton(nnote, Colors.green.hex, lmode > 6 ? LModes.Blinking1t2 : lmode == 0 ? 0 : LModes.Brightness100)

    }
  }

  offNote(nnote) {
    if (!this.#isButtonPressValid(nnote)) return;
    sendNote(this.output, nnote, 0, 0)
    this.#setWebUIButton(nnote, 0, 0)
  }

  offAll() {
    this.forEach(this.offNote);
  }

  forEach(callback) {
    this.forEachMatrix(callback);
    this.forEachTrack(callback);
    this.forEachScene(callback);
  }

  forEachMatrix(callback) {
    for (let i = MatrixButtonIdexes.start; i <= MatrixButtonIdexes.end; i++) {
      callback(i);
    }
  }

  forEachTrack(callback) {
    for (let i = TrackButtonIndexes.start; i <= TrackButtonIndexes.end; i++) {
      callback(i);
    }
    // callback(BottmonRightButtonIdex);
  }

  forEachScene(callback) {
    for (
      let i = SceneLaunchButtonIndexes.start;
      i <= SceneLaunchButtonIndexes.end;
      i++
    ) {
      callback(i);
    }
  }

  updateLook(newLook) {
    this.activeLook = newLook;
  }

  #isMatrixButton(nnote) {
    return nnote >= MatrixButtonIdexes.start && nnote <= MatrixButtonIdexes.end;
  }

  #isSCButton(nnote) {
    return (
      (nnote >= SceneLaunchButtonIndexes.start &&
        nnote <= SceneLaunchButtonIndexes.end) ||
      (nnote >= TrackButtonIndexes.start && nnote <= TrackButtonIndexes.end) ||
      nnote === BottmonRightButtonIdex
    );
  }

  #isButtonPressValid(nnote) {
    if (!this.#isMatrixButton(nnote) && !this.#isSCButton(nnote)) {
      console.log(
        `Button <${nnote}> is neither a matrix button, nor a SC button.`
      );
      return false;
    }
    return true;
  }

  #setWebUIButton(nnote, color, lmode) {
    const element = document.querySelector("#Button" + nnote)

    if (element == null) {
      console.error("WebUI could not be updated because button "+nnote+" is not available!");
      return;
    }
    element.setAttribute("fill", color)

    if (lmode >= 7 && lmode <= 10) {
      element.classList.remove("blinking")
      element.classList.add("pulsing")
    }
    else if (lmode >= 11 && lmode <= 15) {
      element.classList.remove("pulsing")
      element.classList.add("blinking")

    } else {
      element.classList.remove("blinking")
      element.classList.remove("pulsing")
    }

    if (lmode <= LModes.Brightness75) element.classList.add("lowerBrightness")
    else element.classList.remove("lowerBrightness")
    
  }

}

export default APCAPI;
// module.exports = APCAPI;

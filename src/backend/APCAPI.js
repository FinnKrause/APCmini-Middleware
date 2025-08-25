import { sendNote } from "../utils/midiwebapi.js";
import { textToColumns, coordToIndex } from "../utils/usefulFunctions.js";
import {
  SceneLaunchButtonIndexes,
  TrackButtonIndexes,
  MatrixButtonIdexes,
  LModes,
  Colors,
  BottmonRightButtonIdex
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

  animationInterval = null;

  constructor(output, deslook) {
    this.output = output;
    this.activeLook = deslook;
    this.forEach(i => {
      this.setButtonLook(i, "off")
    })
  }

  async setButtonLook(nnote, look) {
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
    await this.changeButton(nnote, queriedLook[look].color, queriedLook[look].lmode);
  }

  async changeButton(nnote, color, lmode) {
    if (!this.#isButtonPressValid(nnote)) return;

    if (this.#isMatrixButton(nnote)) {
      await sendNote(this.output, nnote, color.velocity, lmode)
      this.#setWebUIButton(nnote, color.hex, lmode)

    } else if (this.#isSCButton(nnote)) {
      // sendNote(this.output, nnote, lmode > 6 ? 0x02 : lmode == 0 ? 0x0 : 0x01, 0)
      // if color == black then 0x0 else (if lmode > 6 0x02 else 0x01)
      await sendNote(this.output, nnote, color.velocity == 0 ? 0x0 : (lmode > 6 ? 0x02 : 0x01), 0)
      this.#setWebUIButton(nnote, Colors.green.hex, lmode > 6 ? LModes.Blinking1t2 : lmode == 0 ? 0 : LModes.Brightness100)
      this.#setWebUIButton(nnote, color.velocity != 0 ? Colors.green.hex : Colors.black.hex, lmode > 6 ? LModes.Blinking1t2 : LModes.Brightness100)

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

  setWebUIFader(nnote, velocity) {
    if (nnote == null || velocity == null) return;
    const fader = document.querySelector("#Fader"+nnote)
    fader.style.transform = `translateY(${105 - ((velocity/127) * 105)}px)`
  }

  displayTextAnimation(text = "TEST", speed = 200, infinite = false, duration, paddingFront = 2, paddingEnd = 2, customPixelActivationFunction = (idx, on) => {
    this.changeButton(idx, on?Colors.green:Colors.black, LModes.Brightness100)
  }) {
    console.log("Async task launched");
    if (this.animationInterval != null) return;
    let columns = textToColumns(text);

     // setTimeout(() => {}, 400)r

    //Dann scrollen
    if (columns.length>8) {
      columns = [...columns, ...Array(paddingFront).fill([0,0,0,0,0,0,0])];
      columns = [...Array(paddingEnd).fill([0,0,0,0,0,0,0]), ...columns];

      let offset = 0;
      this.animationInterval = setInterval(() => {
        this.#renderFrame(columns, offset, customPixelActivationFunction);
        offset = (offset + 1) % columns.length;
      }, speed);
    }
    else {
      this.animationInterval = setInterval(() => {
        this.#renderFrame(columns, 0, customPixelActivationFunction);
      }, speed);
    
    }

    if (infinite == false || infinite == undefined) setTimeout(this.abortTextAnimation, duration || columns.length*speed)

    return this.abortTextAnimation;
  }

  abortTextAnimation = () => {
    if (!this.animationInterval) return;
      clearInterval(this.animationInterval)
      this.animationInterval = null;
      console.log("Animation terminated!")
    }

  #renderFrame(columns, offset, customPixelActivationFunction) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let index = coordToIndex(row, col);
        let columnData = columns[col + offset] || [0,0,0,0,0,0,0];
        let pixelOn = (row < 7) ? columnData[row] : 0;
        if (customPixelActivationFunction != null) customPixelActivationFunction(index, pixelOn===1);
        else this.changeButton(index, pixelOn === 1 ? Colors.green : Colors.black, LModes.Brightness100);
        
      }
    }
  }
}

export default APCAPI;
// module.exports = APCAPI;

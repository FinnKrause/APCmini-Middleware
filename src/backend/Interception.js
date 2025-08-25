import APCAPI from "./APCAPI.js";
import {Colors, LModes, FaderIndexes, defaultOffLook} from "./constants.js"
import {compareMaps, compareSets, MapToArray} from "../utils/usefulFunctions.js"
import { getMIDIOutput, getMIDIInput, onNoteOn, getOldDataScheme, onFaderChange } from "../utils/midiwebapi.js";
// const APCAPI = require("./APCAPI.js");
// const { getMIDIOutput, getMIDIInput, onNoteOn, sendNote, getOldDataScheme, onFaderChange } = require("../utils/midiwebapi.js");

class Interception {

  APCmini;
  activeNotes = new Set();
  deviceLocked = false
  state = {}

  constructor(defaultLooksMap, updateLockStatusFunction) {
    this.defaultLooksMap = defaultLooksMap;
    this.originalLooksMap = structuredClone(defaultLooksMap)
    this.updateLockStatusFunction = updateLockStatusFunction;
  }
  
  async connectToDevices(toAPC, fromAPC, toJoker, fromJoker) {
    this.toAPC = await getMIDIOutput(toAPC);
    this.fromAPC = await getMIDIInput(fromAPC);
    this.toJoker = await getMIDIOutput(toJoker);
    this.fromJoker = await getMIDIInput(fromJoker);
    
    this.APCmini = new APCAPI(this.toAPC, this.defaultLooksMap)
    return Promise.resolve()
  }

  async intersept(onMessageConfirmationReceive) {
    onNoteOn(this.fromAPC, async (msg) => {
      const {note, velocity} = getOldDataScheme(msg)
      if (!this.deviceLocked) await this.toJoker.send(msg)

      if (velocity == 127) this.#setCurrentlyPressedNote(note)
      else if (velocity === 0) this.#deleteCurrentlyPressedNote(note)

      
      if (msg[0] !== 176) return;
      if (note <= FaderIndexes.end && note >= FaderIndexes.start) this.APCmini.setWebUIFader(note, velocity)
    })

    onNoteOn(this.fromJoker, msg => {
      const formattedData = getOldDataScheme(msg)
      onMessageConfirmationReceive(formattedData)

      const registeredOn = () => {
        this.APCmini.setButtonLook(formattedData.note, "on");
        this.state[formattedData.note] = "on"
      }

      const registeredOff = () => {
        this.APCmini.setButtonLook(formattedData.note, "off");
        this.state[formattedData.note] = "off"
      }

      // MacOS Konditionen
      if (formattedData.velocity == 64 && msg[0] == 144) registeredOn();
      else if (formattedData.velocity == 64 && msg[0] == 128) registeredOff();
      
      //Windows Konditionen
      else if (formattedData.velocity == 64) registeredOn();
      else registeredOff();

    })

    onFaderChange(this.fromAPC, (msg) => {
      this.toJoker.send(msg)
      this.APCmini.setWebUIFader(msg)
    })

    console.log("Interception running");

  }

  killConnection() {
    this.fromAPC.close();
    this.toAPC.close();
    this.fromJoker.close();
    this.toJoker.close();
    console.log("Connections killed")
  }

  updateLooksmap(newLooksMap) {
    if (newLooksMap == null) {
      console.error("No new Looksmap provided... Returning");
      return;
    }
    this.defaultLooksMap = newLooksMap;
    this.originalLooksMap = structuredClone(newLooksMap)

    if (this.APCmini) {
      this.APCmini.updateLook(newLooksMap)
      this.APCmini.forEach(i => this.APCmini.setButtonLook(i, this.state[i]??"off"))
    }
  }

  updateLook(nnote, newlook) {
    // if (nnote==undefined||newlook==undefined) return;
    this.defaultLooksMap.set(nnote, newlook)
    if (this.APCmini) {
      this.APCmini.updateLook(this.defaultLooksMap)
      this.APCmini.setButtonLook(nnote, "off")
    }
  }

  updateOriginalLooksMap() {
    // this.defaultLooksMap = structuredClone(this.originalLooksMap)
    this.originalLooksMap = structuredClone(this.defaultLooksMap)

  }

  discardAllChanges() {
    this.defaultLooksMap = structuredClone(this.originalLooksMap)
    if (this.APCmini) {
      this.APCmini.updateLook(this.defaultLooksMap)
      this.APCmini.forEach(i => this.APCmini.setButtonLook(i, "off"))
    }
  }

  canOverwrite() {
    if (compareMaps(this.defaultLooksMap, this.originalLooksMap)) {
      return true;
    }
    return false;
  }

  highlightNote(nnote) {
    if (!this.APCmini)return;
    this.APCmini.changeButton(nnote, Colors.skyBlue, LModes.Pulsing1t4)
  }

  removeHighlight(nnote) {
    if (!this.APCmini)return;
    this.APCmini.setButtonLook(nnote, "off")
  }

  lockDesk() {
    if (!this.APCmini) return;
    this.deviceLocked = true;
    this.APCmini.displayTextAnimation("Locked", 200, true, undefined, undefined, 8, (idx, on) => {
      this.APCmini.changeButton(idx, on?Colors.green:Colors.blue, LModes.Brightness100)
    })
  }

  unlockDesk() {
    this.deviceLocked = false;
    this.APCmini.abortTextAnimation();

    this.APCmini.forEach((index) => {
      const oldlook = this.state[index] ?? "off";
      this.APCmini.setButtonLook(index, oldlook)
    })

    this.updateLockStatusFunction();
  }

  isDeskLocked() {
    return this.deviceLocked;
  }

  #getCurrentlyPressedButtons() {
    let elements = []
    for (const elem of this.activeNotes) {
      elements.push(elem)
    }
    return elements
  }

  #setCurrentlyPressedNote(nnote) {
    this.activeNotes.add(nnote)
     
    // console.log(MapToArray(this.activeNotes).join(" "))

    if (compareSets(this.activeNotes, new Set().add(120).add(127).add(71))) {
      this.lockDesk();
    }

    if (compareSets(this.activeNotes, new Set().add(63).add(56).add(7))) {
      this.unlockDesk();
    }

  }

  #deleteCurrentlyPressedNote(nnote) {
    this.activeNotes.delete(nnote)
  }

}

export default Interception;
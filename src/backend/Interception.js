import APCAPI from "./APCAPI.js";
import {Colors, LModes, FaderIndexes} from "./constants.js"
import {compareMaps} from "../utils/usefulFunctions.js"
import { getMIDIOutput, getMIDIInput, onNoteOn, getOldDataScheme, onFaderChange } from "../utils/midiwebapi.js";

// const APCAPI = require("./APCAPI.js");
// const { getMIDIOutput, getMIDIInput, onNoteOn, sendNote, getOldDataScheme, onFaderChange } = require("../utils/midiwebapi.js");

class Interception {

  APCmini;

  constructor(defaultLooksMap) {
    this.defaultLooksMap = defaultLooksMap;
    this.originalLooksMap = structuredClone(defaultLooksMap)
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
    onNoteOn(this.fromAPC, (msg) => {
      this.toJoker.send(msg)

      const {note, velocity} = getOldDataScheme(msg)
      this.APCmini.setWebUIFader(note, velocity)
    })

    onNoteOn(this.fromJoker, msg => {
      const formattedData = getOldDataScheme(msg)
      onMessageConfirmationReceive(formattedData)

      
      if (formattedData.velocity == 64) this.APCmini.setButtonLook(formattedData.note, "on");
      else this.APCmini.setButtonLook(formattedData.note, "off");
    })

    onFaderChange(this.fromAPC, (msg) => {
      this.toJoker.send(msg)
      console.log(msg)
      this.APCmini.setWebUIFader(msg)
    })

    console.log("Interception running smoothly");

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
      this.APCmini.forEach(i => this.APCmini.setButtonLook(i, "off"))
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
    this.defaultLooksMap = structuredClone(this.originalLooksMap)
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

}

export default Interception;
// module.exports = Interception;

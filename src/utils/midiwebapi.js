async function getMIDIInput(name) {
    const midiAccess = await navigator.requestMIDIAccess();
    if (!navigator.requestMIDIAccess) {
      console.error("Web MIDI API is not supported in this environment.");
      return;
    }
    let res = null;
    await midiAccess.inputs.forEach((input) => {
      if (input.name === name) {
        input.open()
        console.log("MIDI Input Device connected:", input.name);
        res = input;
      }
    });
    return res;

}

async function getMIDIOutput(name) {
    const midiAccess = await navigator.requestMIDIAccess();
    if (!navigator.requestMIDIAccess) {
        console.error("Web MIDI API is not supported in this environment.");
        return;
    }
    let res = null;

    await midiAccess.outputs.forEach((o) => {
        if (o.name === name) {
        o.open()
        res = o;
        console.log("MIDI Output Device connected:", o.name);
        }
    });
    return res;
}

async function getMIDIInputs() {
    const midiAccess = await navigator.requestMIDIAccess();
    const devices = []
    midiAccess.inputs.forEach(i => devices.push(i.name))
    return Promise.resolve(devices)
}

async function getMIDIOutputs() {
    const midiAccess = await navigator.requestMIDIAccess();
    const devices = []
    midiAccess.outputs.forEach(i => devices.push(i.name))
    return Promise.resolve(devices)
}

async function onNoteOn(input, callback) {
    await input.addEventListener("midimessage", async i => {
        callback(i.data)
    })
}

async function onFaderChange(input, callback) {
    await input.addEventListener("statechange", async i => {
        callback(i.data)
    })
}

async function sendNote(output, nnote, color, lmode) {
    await output.send([0x90 + lmode , nnote, color])
}

function getOldDataScheme(message) {
    const note = message[1];
    const velocity = message[2];
    const channel = message[0] & 0x0F;

    return {note, velocity, channel}
}

export  {
    getMIDIInput, getMIDIOutput, getMIDIInputs, getMIDIOutputs, onNoteOn, onFaderChange, sendNote, getOldDataScheme
}

// module.exports = {
//     getMIDIInput, getMIDIOutput, getMIDIInputs, getMIDIOutputs, onNoteOn, onFaderChange, sendNote, getOldDataScheme
// }
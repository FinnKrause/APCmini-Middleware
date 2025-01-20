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

function onNoteOn(input, callback) {
    input.addEventListener("midimessage", i => {
        callback(i.data)
    })
}

function onFaderChange(input, callback) {
    input.addEventListener("statechange", i => {
        callback(i.data)
    })
}

function sendNote(output, nnote, color, lmode) {
    output.send([0x90 + lmode , nnote, color])
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
  import { getMIDIInputs } from "./utils/midiwebapi.js"
  import { findClosestColor, getColorFromHex } from "./utils/colorMagic.js"
  import { defaultOffLook, defaultOnLook } from "./backend/constants.js";
  import Interception from "./backend/Interception.js"

  const interception = new Interception(new Map(), UIUpdateLockStatus)
  let selectedItems = new Set()
  let configPath = undefined;

  function connectToMIDIDevices() {
    const selected1 = document.getElementById('dropdown1');
    const selected2 = document.getElementById('dropdown2');
    const selected3 = document.getElementById('dropdown3');
    const selected4 = document.getElementById('dropdown4');


    interception.connectToDevices(selected1.value, selected2.value, selected3.value, selected4.value).then(res => {
      document.getElementById("midiButtons").removeChild(document.getElementById("connectButton"))
      document.getElementById("midiButtons").removeChild(document.getElementById("reloadButton"))
      selected1.disabled = true;
      selected2.disabled = true;
      selected3.disabled = true;
      selected4.disabled = true;
      interception.intersept(msg => {

      })
      UIUpdateLockStatus();
    })

  }

  function fillMIDIMenu() {
    const selected1 = document.getElementById('dropdown1');
    const selected2 = document.getElementById('dropdown2');
    const selected3 = document.getElementById('dropdown3');
    const selected4 = document.getElementById('dropdown4');

    const inputs = getMIDIInputs().then(result => {
      selected1.innerHTML = ""
      selected2.innerHTML = ""
      selected3.innerHTML = ""
      selected4.innerHTML = ""
      result.forEach(i => {
        const OptionElement = document.createElement("option")
        const OptionElement2 = document.createElement("option")
        const OptionElement3 = document.createElement("option")
        const OptionElement4 = document.createElement("option")
        OptionElement.value = i
        OptionElement.textContent = i
        OptionElement2.value = i
        OptionElement2.textContent = i
        OptionElement3.value = i
        OptionElement3.textContent = i
        OptionElement4.value = i
        OptionElement4.textContent = i
        selected1.appendChild(OptionElement)
        selected2.appendChild(OptionElement2)
        selected3.appendChild(OptionElement3)
        selected4.appendChild(OptionElement4)
      })
      if (result.includes("JokerIn")) {
        selected3.selectedIndex = result.indexOf("JokerIn")
      }
      else if (result.includes("Joker In")) {
        selected3.selectedIndex = result.indexOf("Joker In")
      }

      if (result.includes("JokerOut")) {
        selected4.selectedIndex = result.indexOf("JokerOut")
      }
      else if (result.includes("Joker Out")) {
        selected4.selectedIndex = result.indexOf("Joker Out")
      }

      if (result.includes("APC mini mk2")) {
        selected1.selectedIndex = result.indexOf("APC mini mk2")
      } else if (result.includes("APC mini mk2 Control")) {
        selected1.selectedIndex = result.indexOf("APC mini mk2 Control")
      }

      if (result.includes("APC mini mk2")) {
        selected2.selectedIndex = result.indexOf("APC mini mk2")
      }
      else if (result.includes("APC mini mk2 Control")) {
        selected2.selectedIndex = result.indexOf("APC mini mk2 Control")

      }
    })

  }

  function MapToJSON(map) {
    return Object.fromEntries(map)
  }

  function JSONToMAP(json) {
    const map = new Map();
    for (const key of Object.keys(json)) {
      map.set(+key, json[key])
    }
    return map;
  }

  function handleFirstSelection(nnote, target) {
    const look = interception.defaultLooksMap.get(nnote)
    const offcolor = document.getElementById("offcolor")
    const oncolor = document.getElementById("oncolor")
    const offMode = document.getElementById("offMode")
    const onMode = document.getElementById("onMode")
    const ButtonLabelInput = document.getElementById("ButtonLabelInput")
    ButtonLabelInput.value = look?.label ?? ""

    offcolor.value = look?.off?.color?.hex ?? defaultOffLook.color.hex;
    offMode.selectedIndex = look?.off?.lmode ?? defaultOffLook.lmode

    oncolor.value = look?.on?.color?.hex ?? defaultOnLook.color.hex;
    onMode.selectedIndex = look?.on?.lmode ?? defaultOnLook.lmode

  }

  function lockEditSection() {
    const on = document.getElementById("offcolor")
    const off = document.getElementById("oncolor")
    document.getElementById("UpdateEditButton").disabled = true
    document.getElementById("offMode").disabled = true
    document.getElementById("onMode").disabled = true
    document.getElementById("ButtonLabelInput").disabled = true
    document.getElementById("OverwriteLabelCheckbox").disabled = true

    on.value = "#FFFFFF"
    on.disabled = true
    off.value = "#FFFFFF"
    off.disabled = true
    document.getElementById("ButtonLabelInput").value = ""
    document.getElementById("OverwriteLabelCheckbox").checked = false
  }

  function unlockEditSection() {
    document.getElementById("offcolor").disabled = false
    document.getElementById("oncolor").disabled = false
    document.getElementById("offMode").disabled = false
    document.getElementById("onMode").disabled = false
    document.getElementById("UpdateEditButton").disabled = false
    document.getElementById("ButtonLabelInput").disabled = false
    document.getElementById("OverwriteLabelCheckbox").disabled = false
  }

  function selectNote(nnote, element) {
    selectedItems.add(nnote)
    element.classList.add("selected")

    const selectedCells = document.getElementById("selectedCells")
    const newElement = document.createElement("div")
    newElement.innerText = nnote
    newElement.classList.add("selectedCell")
    newElement.id = "selectedCell" + nnote
    selectedCells.appendChild(newElement)
    interception.highlightNote(nnote)

    if (selectedItems.size > 0) {
      unlockEditSection();
    }
  }

  function unselectNote(nnoteID, element) {
    selectedItems.delete(nnoteID)
    element.classList.remove("selected")
    interception.removeHighlight(nnoteID)

    const selectedCells = document.getElementById("selectedCells").removeChild(document.getElementById("selectedCell" + nnoteID))
    if (selectedItems.size === 0) lockEditSection();
  }

  function clearAllSelected() {
    selectedItems.forEach(i => {
      unselectNote(i, document.getElementById("Button" + i))
    })
  }

  function updateConfigPath(newPath) {
    configPath = newPath;
    const domPathElement = document.getElementById("LoadedConfigName")
    domPathElement.innerText = "Loaded Config: " + configPath
  }

  function updateAllButtonStates() {
    updateNewEmptyProjectButtonState()
    updateDiscardChangesButtonState()
    updateOpenFileButtonState()
    updateSaveButtonState()
  }

  function updateNewEmptyProjectButtonState() {
    const newEmptyProjectButton = document.getElementById("NewEmptyProjectButton")
    if (interception.defaultLooksMap.size === 0 || interception.canOverwrite() === false) {
      newEmptyProjectButton.disabled = true;
    }
    else {
      newEmptyProjectButton.disabled = false;
    }
  }

  function updateDiscardChangesButtonState() {
    const discardChangesButton = document.getElementById("DiscardChangesButton")
    if (interception.canOverwrite()) {
      discardChangesButton.disabled = true;
    }
    else {
      discardChangesButton.disabled = false;
    }
  }

  function updateOpenFileButtonState() {
    const loadConfigButton = document.getElementById("loadConfigButton")
    if (interception.canOverwrite()) {
      loadConfigButton.disabled = false;
    }
    else {
      loadConfigButton.disabled = true;
    }
  }

  function updateSaveButtonState() {
    const saveButton = document.getElementById("saveButton")
    if (configPath && !interception.canOverwrite()) {
      saveButton.disabled = false;
    }
    else {
      saveButton.disabled = true;
    }
  }

  function updateLook() {
    const offcolor = document.getElementById("offcolor")
    const oncolor = document.getElementById("oncolor")
    const offMode = document.getElementById("offMode")
    const onMode = document.getElementById("onMode")

    const actualOffColor = getColorFromHex(offcolor.value)
    const actualOnColor = getColorFromHex(oncolor.value)

    const shouldOverwrite = document.getElementById("OverwriteLabelCheckbox").checked
    const label = document.getElementById("ButtonLabelInput").value

    for (const cell of selectedItems) {
        if (!shouldOverwrite) {
             interception.updateLook(cell, {
                on: { color: actualOnColor, lmode: onMode.selectedIndex },
                off: { color: actualOffColor, lmode: offMode.selectedIndex },
            });
        }
        else interception.updateLook(cell, {
            on: { color: actualOnColor, lmode: onMode.selectedIndex },
            off: { color: actualOffColor, lmode: offMode.selectedIndex },
            label: label
        });
    }

    interception.reinitializeLabels()

    clearAllSelected();

    // document.getElementById("NewEmptyProjectButton").disabled = true
    // document.getElementById("DiscardChangesButton").disabled = false
    // document.getElementById("loadConfigButton").disabled = true;

    if (configPath) document.getElementById("saveButton").disabled = false;
  }

  const lockOpen = document.getElementById("lock-open");
  const lockClosed = document.getElementById("lock-closed");
  lockOpen.addEventListener("click", () => {
    interception.lockDesk();
    UIUpdateLockStatus();
  })

  function UIUpdateLockStatus() {
    lockClosed.style.display = interception.isDeskLocked() ? "block" : "none"
    lockOpen.style.display = interception.isDeskLocked() ? "none" : "block"
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillMIDIMenu()

    const connectButton = document.getElementById("connectButton")
    const reloadButton = document.getElementById("reloadButton").onclick = fillMIDIMenu
    connectButton.onclick = () => {
      const selected1 = document.getElementById('dropdown1');
      const selected2 = document.getElementById('dropdown2');
      const selected3 = document.getElementById('dropdown3');
      const selected4 = document.getElementById('dropdown4');
      if (!(selected1.value != "Bitte wählen" && selected2.value != "Bitte wählen" && selected3.value != "Bitte wählen" && selected4.value != "Bitte wählen" && (new Set([selected1.value, selected2.value, selected3.value, selected4.value]).size >= 3))) {
        // Wenn Duplikate oder nicht ausgewählt
        alert("The current MIDI Selection is not valid. Check that the program 'loopMIDI' is running and that the MIDI Device is connected!")
        return;
      }

      connectToMIDIDevices();
    }

    const saveButton = document.getElementById("saveButton")
    saveButton.onclick = async () => {
      if (configPath == undefined) {
        alert("No config loaded. Cannot save")
        return;
      }

      const result = await window.electronAPI.writeFile(configPath, JSON.stringify(MapToJSON(interception.defaultLooksMap)))
      interception.updateOriginalLooksMap();

      updateAllButtonStates()


    }

    const saveConfigButton = document.getElementById("saveConfigButton")
    saveConfigButton.onclick = async () => {
      const { canceled, filePath } = await window.electronAPI.showSaveDialog({
        buttonLabel: "Save config",
        defaultPath: `BÄN-${Date.now()}.tk`
      });

      if (canceled) return;

      const result = await window.electronAPI.writeFile(filePath, JSON.stringify(MapToJSON(interception.defaultLooksMap)))

      if (!result.success) {
        alert(result.error)
        return;
      }

      interception.updateOriginalLooksMap();
      updateConfigPath(filePath)
      // document.getElementById("NewEmptyProjectButton").disabled = false;
      // document.getElementById("DiscardChangesButton").disabled = true
      // document.getElementById("loadConfigButton").disabled = false;
      updateAllButtonStates()


      alert("The config was saved at \"" + filePath + "\".")
    }

    const loadConfigButton = document.getElementById("loadConfigButton")
    loadConfigButton.onclick = async () => {

      if (!interception.canOverwrite()) {
        alert("Please save your current config before importing a new one. Otherwise your work will be gone forever.")
        return;
      }

      const options = {
        title: "Open File",
        properties: ["openFile"],
        filters: [
          { name: "MTG-Technik", extensions: ["tk"] },
          // { name: "All Files", extensions: ["*"] },
        ],
      };

      const result = await window.electronAPI.openFileDialog(options);

      if (!result.canceled) {
        const filePath = result.filePaths[0];

        // Optionally read the file after selecting
        const readResult = await window.electronAPI.readFile(filePath).then(res => {
          if (res.success) {

            const newMap = JSONToMAP(JSON.parse(res.data));
            interception.updateLooksmap(newMap)

            // document.getElementById("NewEmptyProjectButton").disabled = false;
            // document.getElementById("DiscardChangesButton").disabled = true
            // document.getElementById("loadConfigButton").disabled = false;
            updateAllButtonStates();


          } else {
            alert("Error Reading File:", res.error);
          }
        })

        updateConfigPath(filePath)

      } else {
        console.log("Open dialog was canceled.");
      }
    }

    const pultSVG = document.getElementById("PultSVG")
    pultSVG.onclick = (e) => {

      //TODO: Fader Markierung einbauen
      if (interception.isDeskLocked()) return;
    
      if (e.target.id.startsWith("Button")) {
        if (e.target.classList.contains("selected")) {
          unselectNote(+e.target.id.replace("Button", ""), e.target)
          return
        }

        selectNote(+e.target.id.replace("Button", ""), e.target)

   
        if (selectedItems.size === 1) {
          handleFirstSelection(+e.target.id.replace("Button", ""), e.target)
        }
      }
      else {
        clearAllSelected();
      }
    }

    const offcolor = document.getElementById("offcolor")
    const oncolor = document.getElementById("oncolor")
    // const ButtonLabelInput = document.getElementById("ButtonLabelInput")
    offcolor.onchange = i => {
      i.target.value = findClosestColor(i.target.value).hex

    }
    oncolor.onchange = i => {
      i.target.value = findClosestColor(i.target.value).hex

    }

    const UpdateEditButton = document.getElementById("UpdateEditButton")
    UpdateEditButton.onclick = updateLook

    const NewEmptyProjectButton = document.getElementById("NewEmptyProjectButton")
    NewEmptyProjectButton.onclick = () => {
      document.getElementById("LoadedConfigName").innerText = ""
      configPath = undefined
      // document.getElementById("NewEmptyProjectButton").disabled = true
      // document.getElementById("saveButton").disabled = true;
      // document.getElementById("loadConfigButton").disabled = false;
      updateAllButtonStates()

      interception.updateLooksmap(new Map())
    }
    const DiscardChangesButton = document.getElementById("DiscardChangesButton")
    DiscardChangesButton.onclick = () => {

      interception.discardAllChanges();
      // document.getElementById("NewEmptyProjectButton").disabled = false
      // document.getElementById("DiscardChangesButton").disabled = true
      // document.getElementById("saveButton").disabled = true;
      // document.getElementById("loadConfigButton").disabled = false;
      updateAllButtonStates();

    }
  })
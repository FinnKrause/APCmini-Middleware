  import { getMIDIInputs } from "./utils/midiwebapi.js"
  import { findClosestColor, getColorFromHex } from "./utils/colorMagic.js"
  import { defaultOffLook, defaultOnLook } from "./backend/constants.js";
  import Interception from "./backend/Interception.js"
import { exportSectionAsPDF } from "./utils/saveToPDF.js";

  const interception = new Interception(new Map(), UIUpdateLockStatus)
  let selectedItems = new Set()
  let projectFilePath = undefined;

  //Global HTML Elements
  const lockOpen = document.getElementById("lock-open");
  const lockClosed = document.getElementById("lock-closed");

  // Menu Clicks
  window.toFrontEnd.onMenuClick((data, params) => {
    switch (data) {
      case "newProject": NewEmptyProjectButtonClick(); break;
      case "openFile": loadConfigButtonClick(); break;
      case "save": saveButtonClick(); break;
      case "saveAs": saveAsButtonClick(); break;
      case "discardChanges": discardChangesButtonClick(); break;
      case "toggleSettings": toggleSettings(); break;
      case "printConsole": printConsole(params); break;
      default: break;
    }
  })

  function connectToMIDIDevices() {
    const selected1 = document.getElementById('dropdown1');
    const selected2 = document.getElementById('dropdown2');
    const selected3 = document.getElementById('dropdown3');
    const selected4 = document.getElementById('dropdown4');


    interception.connectToDevices(selected1.value, selected2.value, selected3.value, selected4.value).then(res => interception.intersept(msg => {
    }))

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

    on.value = "#000000"
    on.disabled = true
    off.value = "#000000"
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
    projectFilePath = newPath;
    const domPathElement = document.getElementById("LoadedConfigName")
    domPathElement.innerText = "Loaded Config: " + projectFilePath
  }

  function updateAllButtonStates() {
    updateNewEmptyProjectButtonState()
    updateDiscardChangesButtonState()
    updateOpenFileButtonState()
    updateSaveButtonState()
  }

  function updateNewEmptyProjectButtonState() {
    //! ACHTUNG: Logik umgedreht, da Button disabled sein soll wenn true
    const newEmptyProjectButton = document.getElementById("NewEmptyProjectButton")
    const ButtonDisabledState = (interception.defaultLooksMap.size === 0 || interception.canOverwrite() === false)

    newEmptyProjectButton.disabled = ButtonDisabledState;
    window.electronAPI.updateMenuState({ newProject: !ButtonDisabledState })
    //
    // if (interception.defaultLooksMap.size === 0 || interception.canOverwrite() === false) {
    //   newEmptyProjectButton.disabled = true;
    // }
    // else {
    //   newEmptyProjectButton.disabled = false;
    // }
  }

  function updateDiscardChangesButtonState() {
    const discardChangesButton = document.getElementById("DiscardChangesButton")
    const ButtonEnabledState = (!interception.canOverwrite())

    discardChangesButton.disabled = !ButtonEnabledState;
    window.electronAPI.updateMenuState({ discardChanges: ButtonEnabledState })
    // if (interception.canOverwrite()) {
    //   discardChangesButton.disabled = true;
    // }
    // else {
    //   discardChangesButton.disabled = false;
    // }
  }

  function updateOpenFileButtonState() {
    const loadConfigButton = document.getElementById("loadConfigButton")
    const ButtonEnabledState = (interception.canOverwrite())
    
    loadConfigButton.disabled = !ButtonEnabledState;
    window.electronAPI.updateMenuState({ openFile: ButtonEnabledState })

  }

  function updateSaveButtonState() {
    const saveButton = document.getElementById("saveButton")
    const ButtonEnabledState = (projectFilePath && !interception.canOverwrite())==true

    saveButton.disabled = !ButtonEnabledState;
    window.electronAPI.updateMenuState({save: ButtonEnabledState})
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

    interception.reinizialzeLabelsFor([...selectedItems.values()])
    clearAllSelected();

    // document.getElementById("NewEmptyProjectButton").disabled = true
    // document.getElementById("DiscardChangesButton").disabled = false
    // document.getElementById("loadConfigButton").disabled = true;

    // if (projectFilePath) document.getElementById("saveButton").disabled = false;
    updateAllButtonStates()
  }

  lockOpen.addEventListener("click", () => {
    interception.lockDesk();
    UIUpdateLockStatus();
  })

  function UIUpdateLockStatus() {
    lockClosed.style.display = interception.isDeskLocked() ? "block" : "none"
    lockOpen.style.display = interception.isDeskLocked() ? "none" : "block"
  }

  async function NewEmptyProjectButtonClick() {
    document.getElementById("LoadedConfigName").innerText = ""
    projectFilePath = undefined
    updateAllButtonStates()
    interception.updateLooksmap(new Map())
  }

  async function saveButtonClick() {
      if (projectFilePath == undefined) {
        alert("No config loaded. Cannot save")
        return;
      }

      const result = await window.electronAPI.writeFile(projectFilePath, JSON.stringify(MapToJSON(interception.defaultLooksMap)))
      interception.updateOriginalLooksMap();

      updateAllButtonStates()

  }

  async function saveAsButtonClick() {
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

  async function loadConfigButtonClick() {

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
            updateAllButtonStates();


          } else {
            alert("Error Reading File:", res.error);
          }
        })

        updateConfigPath(filePath)

      } 
  }

  async function discardChangesButtonClick() {
    interception.discardAllChanges();
    updateAllButtonStates();
  }

  async function toggleSettings() {
    const SettingsElement = document.getElementById("Settings")
    SettingsElement.style.display = SettingsElement.style.display==="none"?"block":"none";
  }

  function PresettingsconnectButtonClick() {
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
    UIUpdateLockStatus();
    document.getElementById("bottomPart").removeChild(document.getElementById("PrestartSettings"))

    document.getElementById("Pult").style.display = "block";
    document.getElementById("Settings").style.display = "block";
    window.electronAPI.updateMenuState({ toggleSettings: true, printConsole: true })

  }

  function connectButtonClick() {
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
    UIUpdateLockStatus();
    document.getElementById("Settings").removeChild(document.getElementById("MidiSettings"))
        document.getElementById("Pult").style.display = "block";
    document.getElementById("Settings").style.display = "block";
  }

  async function DemoButtonClick() {
    document.getElementById("bottomPart").removeChild(document.getElementById("PrestartSettings"))
    document.getElementById("Pult").style.display = "block";
    document.getElementById("Settings").style.display = "block";
    document.getElementById("MidiSettings").style.display = "block";

    document.getElementById("reloadButton").onclick = fillMIDIMenu

    const connectButton = document.getElementById("connectButton")
    connectButton.onclick = connectButtonClick
    fillMIDIMenu();
    window.electronAPI.updateMenuState({ toggleSettings: true, printConsole: true })
  }

  function printConsole(showNumbers) {
      const body = document.querySelector("body")

      const glass_primary = body.style.getPropertyValue("--glass-primary");
      const console_background = body.style.getPropertyValue("--console-background");
      const console_lighter_background = body.style.getPropertyValue("--console-lighter-background");
      const lowerBrightness = body.style.getPropertyValue("--lower-brightness-darkening-effect-percent");
      const console_button_font_size = body.style.getPropertyValue("--console-button-font-size");
      
      body.style.setProperty("--glass-primary", "#FFFFFF");
      body.style.setProperty("--console-background", "#ffffffff");
      body.style.setProperty("--console-lighter-background", "#ffffffff");
      body.style.setProperty("--lower-brightness-darkening-effect-percent", "100%");
      body.style.setProperty("--console-button-font-size", "10px");
      document.getElementById("Pult").style.padding = "10px";
      document.getElementById("PultSVG").style.border = "3px solid black";
      const changeBackFunction = interception.simulateOffStateForPDF()
      interception.reinitializeLabels(showNumbers)

      exportSectionAsPDF("#Pult")

      body.style.setProperty("--glass-primary", glass_primary);
      body.style.setProperty("--console-background", console_background);
      body.style.setProperty("--console-lighter-background", console_lighter_background);
      body.style.setProperty("--lower-brightness-darkening-effect-percent", lowerBrightness);
      body.style.setProperty("--console-button-font-size", console_button_font_size);
      changeBackFunction();
      document.getElementById("PultSVG").style.border = "none";
      document.getElementById("Pult").style.padding = "0px";
      interception.reinitializeLabels(true)
  }


  document.addEventListener("DOMContentLoaded", () => {
    fillMIDIMenu()
    document.getElementById("reloadButton").onclick = fillMIDIMenu

    const connectButton = document.getElementById("connectButton")
    connectButton.onclick = PresettingsconnectButtonClick

    const DemoButton = document.getElementById("DemoButton")
    DemoButton.onclick = DemoButtonClick

    const saveButton = document.getElementById("saveButton")
    saveButton.onclick = saveButtonClick

    const saveConfigButton = document.getElementById("saveConfigButton")
    saveConfigButton.onclick = saveAsButtonClick

    const loadConfigButton = document.getElementById("loadConfigButton")
    loadConfigButton.onclick = loadConfigButtonClick

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
    offcolor.onchange = i => {
      i.target.value = findClosestColor(i.target.value).hex
    }
    oncolor.onchange = i => {
      i.target.value = findClosestColor(i.target.value).hex
    }

    const UpdateEditButton = document.getElementById("UpdateEditButton")
    UpdateEditButton.onclick = updateLook

    const NewEmptyProjectButton = document.getElementById("NewEmptyProjectButton")
    NewEmptyProjectButton.onclick = NewEmptyProjectButtonClick

    const DiscardChangesButton = document.getElementById("DiscardChangesButton")
    DiscardChangesButton.onclick = discardChangesButtonClick
  })
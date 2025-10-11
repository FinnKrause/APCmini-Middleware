const { app, BrowserWindow, session, ipcMain, dialog, Menu, ipcRenderer } = require("electron");
const path = require("node:path");
const started = require("electron-squirrel-startup");
const { PDFDocument } = require('pdf-lib');
const { readFile, writeFile, writeFileSync } = require("fs");

if (started) {
  app.quit();
}

let mainWindow;
let showNumberIndicators = true;
let currentMenuState = {
  newProject: false,
  openFile: true,
  save: false,
  saveAs: true,
  discardChanges: false,
  toggleSettings: false,
  printConsole: false,
};

const createWindow = () => {
  // Create the browser window.
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "midiSysex" || permission == "midi") {
        // Grant access to MIDI devices with SysEx support
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  mainWindow = new BrowserWindow({
    width: 1360,
    // width: 1920,
    height: 850,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      // enableBlinkFeatures: "Midi",
    },
  });
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  
  // Open the DevTools.
  Menu.setApplicationMenu(buildMenuTemplate());
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("show-save-dialog", async (event, options) => {
  const result = await dialog.showSaveDialog(options);
  return result;
});

ipcMain.handle("open-file-dialog", async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle("read-file", async (event, filePath) => {
  return new Promise((resolve) => {
    readFile(filePath, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        resolve({ success: false, error: err.message }); // Return error if it occurs
      } else {
        resolve({ success: true, data }); // Return success and data if it works
      }
    });
  });
});

ipcMain.handle("write-file", async (event, filePath, data) => {
  try {
    await writeFile(filePath, data, { encoding: "utf-8" }, () => {});
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("update-menu-state", async (event, menuStates) => {
  updateMenuState(menuStates);
  return { success: true };
});

ipcMain.handle('save-image-as-pdf', async (event, imgData) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save as PDF',
    defaultPath: 'export.pdf',
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  if (!filePath) return;

  const base64Data = imgData.replace(/^data:image\/png;base64,/, '');
  const imgBuffer = Buffer.from(base64Data, 'base64');

  const pdfDoc = await PDFDocument.create();
  const img = await pdfDoc.embedPng(imgBuffer);
  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, {
    x: 0,
    y: 0,
    width: img.width,
    height: img.height,
  });

  const pdfBytes = await pdfDoc.save();
  writeFileSync(filePath, pdfBytes);
});


function buildMenuTemplate() {
  return Menu.buildFromTemplate([
    {label: "File", submenu: [
      {label: "New Project File",type: "normal", click: () => {
        mainWindow.webContents.send("menu-click", "newProject");
      }, enabled: currentMenuState.newProject, accelerator: 'CmdOrCtrl+N',},

      {type: "separator"},

      {label: "Open File", type: "normal", enabled: currentMenuState.openFile, accelerator: "CmdOrCtrl+O", click: () => {
        mainWindow.webContents.send("menu-click", "openFile");
      }},

      {type: "separator"},

      {label: "Save", type: "normal", enabled: currentMenuState.save, accelerator: "CmdOrCtrl+S", click: () => {
        mainWindow.webContents.send("menu-click", "save");
      }},
      {label: "Save As", type: "normal", enabled: currentMenuState.saveAs, accelerator: "CmdOrCtrl+Shift+S", click: () => {
        mainWindow.webContents.send("menu-click", "saveAs");
      }},

      {type: "separator"},

      {label: "Discard unsaved Changes", type: "normal", enabled: currentMenuState.discardChanges, click: () => {
        mainWindow.webContents.send("menu-click", "discardChanges");
      }},
    ]},
    {label: "View", submenu: [
      {label: "Toggle Settings", click: () => {
        mainWindow.send("menu-click", "toggleSettings")
      }, enabled: currentMenuState.toggleSettings},
      {type: "separator"},
      {label: "Toggle Fullscreen", accelerator: "F11", click: () => {
        const isFullscreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullscreen);
      }},
    ]},
    {label: "PDF", submenu: [
      {label: "Show button number indicators", type: "checkbox", checked:showNumberIndicators, click: (e) => {
        showNumberIndicators = e.checked;
      }},
      // {type: "separator"},
      {label: "Export Layout as PDF", enabled: currentMenuState.printConsole, click: () => {
        mainWindow.send("menu-click", "printConsole", showNumberIndicators)
      }}
    ]
    }

  ])
}

function updateMenuState(newState) {
  currentMenuState = { ...currentMenuState, ...newState };
  Menu.setApplicationMenu(buildMenuTemplate());
}
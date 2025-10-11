const { contextBridge, ipcRenderer, ipcMain } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  openFileDialog: (options) => ipcRenderer.invoke("open-file-dialog", options), 
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke("write-file", filePath, data),

  updateMenuState: (menuStates) => ipcRenderer.invoke("update-menu-state", menuStates),
  saveImageAsPDF: (imgData) => ipcRenderer.invoke('save-image-as-pdf', imgData),
});

contextBridge.exposeInMainWorld("toFrontEnd", {
  onMenuClick: (callback) => ipcRenderer.on("menu-click", (event, data, params) => callback(data, params)),
});
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  openFileDialog: (options) => ipcRenderer.invoke("open-file-dialog", options), 
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke("write-file", filePath, data),
});
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  requestGoogleCalendarEvents: (accessToken) => ipcRenderer.invoke('request-google-calendar-events', accessToken),
  ipcRenderer: {
    on: (...args) => ipcRenderer.on(...args),
    send: (...args) => ipcRenderer.send(...args),
    removeListener: (...args) => ipcRenderer.removeListener(...args),
  }
});

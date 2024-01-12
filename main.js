const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });
const { google } = require("googleapis");

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // プリロードスクリプトを指定
      contextIsolation: true, // contextIsolationをtrueに設定
    },
  });

  win.loadURL("http://localhost:3000"); // Reactアプリケーションをロード
}
app.whenReady().then(createWindow);

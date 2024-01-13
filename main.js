const { app, BrowserWindow } = require("electron");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });
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

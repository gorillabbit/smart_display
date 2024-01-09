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

let authWindow;
function createAuthWindow() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.REACT_APP_GOOGLE_CALENDER_CLIENT_ID,
    process.env.REACT_APP_GOOGLE_CALENDER_CLIENT_SECRET,
    process.env.REACT_APP_GOOGLE_CALENDER_REDIRECT_URI
  );
  console.log(oauth2Client);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  console.log("authUrl", authUrl);

  authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  authWindow.loadURL(authUrl);
  authWindow.show();

  async function getAccessToken(code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      console.log(`アクセストークン: ${tokens.access_token}`);
      // 取得したアクセストークンをレンダラープロセスに送る
      win.webContents.send("accessToken", tokens.access_token);
    } catch (error) {
      console.error("アクセストークンの取得中にエラーが発生しました", error);
    }
  }

  authWindow.webContents.on("will-navigate", (event, url) => {
    const urlObj = new URL(url);
    const authCode = urlObj.searchParams.get("code");
    console.log(url, authCode);

    if (authCode) {
      // 認証コードを取得した後の処理
      console.log(`認証コード: ${authCode}`);

      // 必要なら認証ウィンドウを閉じる
      authWindow.close();

      // アクセストークンを取得するために認証コードを使用
      getAccessToken(authCode);
    }
  });
}

app.on("ready", createAuthWindow);

ipcMain.handle("request-google-calendar-events", async (event, accessToken) => {
  console.log(accessToken);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth });
  try {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    return res.data.items;
  } catch (error) {
    console.error("Google Calendar API Error:", error);
    throw error;
  }
});

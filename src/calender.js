import React, { useState, useEffect } from "react";

function GoogleCalendar() {
  console.log("google calender");
  const [events, setEvents] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    console.log("最初の読み込み");
    const tokenListener = (event, token) => {
      console.log(token);
      setAccessToken(token);
    };

    //window.electron.ipcRenderer.on("accessToken", tokenListener);

    // イベントリスナーをクリーンアップ
    return () => {
      // window.electron.ipcRenderer.removeListener("accessToken", tokenListener);
    };
  }, []);

  useEffect(() => {
    console.log("アクセストークン更新", accessToken);
    if (accessToken) {
      console.log(accessToken);
      window.electron
        .requestGoogleCalendarEvents(accessToken)
        .then((fetchedEvents) => {
          setEvents(fetchedEvents);
        })
        .catch((error) => {
          console.error("Google Calendar API Error:", error);
        });
    }
  }, [accessToken]); // このuseEffectはaccessTokenが変更されたときに実行される
  console.log(events);

  return (
    <div>
      <h2>Google カレンダー イベント</h2>
      <ul>
        {events.map((event, i) => (
          <li key={i}>
            {event.summary} ({new Date(event.start.dateTime).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GoogleCalendar;

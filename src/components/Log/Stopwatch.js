import React, { useState, useEffect, useRef } from "react";

const formatElapsedTime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${days}日${hours}時間${minutes}分${remainingSeconds}秒`;
};

const UnitTimeMap = {
  秒: 1000,
  分: 1000 * 60,
  時: 1000 * 60 * 60,
  日: 1000 * 60 * 60 * 24,
  週: 1000 * 60 * 60 * 24 * 7,
  月: 1000 * 60 * 60 * 24,
  年: 1000 * 60 * 60 * 24,
};

const Stopwatch = ({ log }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [announceCount, setAnnounceCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
      console.log("a");
    }, 1000);

    const announceInterval = setInterval(() => {
      setAnnounceCount((prev) => prev + 1);
    }, UnitTimeMap[log.voiceAnnounceUnit] * log.voiceAnnounceNum);

    return () => {
      clearInterval(interval);
      clearInterval(announceInterval);
    };
  }, []);

  useEffect(() => {
    if (log.availableVoiceAnnounce && announceCount !== 0) {
      const shortedElapsedTime = formatElapsedTime(elapsedTime).replace(
        /\b0[^\d\s]+\s*/g,
        ""
      );
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(shortedElapsedTime)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announceCount]);

  return <div>経過 {formatElapsedTime(elapsedTime)}</div>;
};

export default Stopwatch;

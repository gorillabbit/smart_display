import React, { useEffect, useState } from "react";
import { deleteDocLog, addDocLogsCompleteLogs } from "../firebase";
import "../App.css";
import {
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "../types";
import { format, differenceInDays } from "date-fns";
import { checkLastLogCompleted } from "../utilities/dateUtilites";
import Stopwatch from "./Stopwatch";

const LogStyle = {
  backgroundColor: "#BEEBC6",
  borderRadius: "8px",
  padding: "4px",
  margin: "2px",
  display: "flex",
};

const logComplete = (log: LogType, event) => {
  event.stopPropagation();
  const logsCompleteLogs = {
    logId: log.id,
    type: "finish",
  };
  addDocLogsCompleteLogs(logsCompleteLogs);
};

const logStart = (log: LogType, event) => {
  event.stopPropagation();
  const logsCompleteLogs = {
    logId: log.id,
    type: "start",
  };
  addDocLogsCompleteLogs(logsCompleteLogs);
};

const deleteLog = (id, event) => {
  event.stopPropagation();
  deleteDocLog(id);
};

const CompleteLog = ({ completeLog, index }) => {
  if (completeLog.timestamp) {
    return (
      <div key={index}>
        {format(completeLog.timestamp.toDate(), "yyyy-MM-dd HH:mm")}
      </div>
    );
  }
};

const Log = ({ log, logsCompleteLogs }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  //前回からの経過時間を表示する
  const [intervalFromLastCompleted, setIntervalFromLastCompleted] =
    useState<string>("");

  const completeLogs = logsCompleteLogs.filter(
    (logsCompleteLog: LogsCompleteLogsType) => logsCompleteLog.logId === log.id
  );
  const finishLogs = completeLogs.filter((log) => log.type === "finish");
  const lastCompletedLog = finishLogs[0];
  const isStarted = completeLogs[0]?.type === "start";
  const isLastCompletedAvailable =
    !!lastCompletedLog && !!lastCompletedLog.timestamp;
  const lastCompleted = isLastCompletedAvailable
    ? format(lastCompletedLog.timestamp.toDate(), "yyyy-MM-dd HH:mm")
    : "";

  useEffect(() => {
    if (isLastCompletedAvailable) {
      setIntervalFromLastCompleted(checkLastLogCompleted(lastCompleted));
      const timerId = setInterval(() => {
        setIntervalFromLastCompleted(checkLastLogCompleted(lastCompleted));
      }, 1000 * 60); // 1分ごとに更新
      return () => {
        clearInterval(timerId);
      };
    }
  }, [lastCompleted, isLastCompletedAvailable]);
  //これまでの完了回数
  const completedCounts = finishLogs.length;
  const todayCompletedCounts = finishLogs.filter(
    (log) => differenceInDays(new Date(), log.timestamp?.toDate()) < 1
  );
  return (
    <div style={LogStyle} onClick={() => setIsOpen((prevOpen) => !prevOpen)}>
      <div style={{ textAlign: "left" }}>
        <div>{log.text}</div>
        <div>{isStarted && <Stopwatch />}</div>
        <div>
          {isLastCompletedAvailable || lastCompletedLog
            ? "前回から " + intervalFromLastCompleted
            : ""}
        </div>
        <div>{"今日の回数 " + todayCompletedCounts.length}</div>
        <div>{"通算完了回数 " + completedCounts}</div>
        {isOpen &&
          completeLogs.map((log: LogsCompleteLogsType, index: string) => (
            <CompleteLog completeLog={log} index={index} />
          ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: "4px",
          flex: "1",
          alignContent: "center",
        }}
      >
        {log.interval && (
          <button
            className="logButton start"
            onClick={(e) => logStart(log, e)}
            disabled={isStarted}
          >
            開始
          </button>
        )}
        <button
          className="logButton add"
          onClick={(e) => logComplete(log, e)}
          disabled={log.interval ? !isStarted : false}
        >
          完了
        </button>
        <button
          className="logButton delete"
          onClick={(e) => deleteLog(log.id, e)}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default Log;

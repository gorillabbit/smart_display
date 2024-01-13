import React, { useEffect, useState } from "react";
import { deleteDocLog, addDocLogsCompleteLogs } from "../firebase";
import "../App.css";
import {
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "../types";
import { format } from "date-fns";
import { checkLastLogCompleted } from "../utilities/dateUtilites";

const LogStyle = {
  backgroundColor: "#BEEBC6",
  borderRadius: "8px",
  padding: "4px",
  margin: "2px",
  display: "flex",
};

const completeLog = (log: LogType, event) => {
  event.stopPropagation();
  const logsCompleteLogs = {
    logId: log.id,
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
  const completedCounts = completeLogs.length;
  const lastCompletedLog = completeLogs[0];
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
  return (
    <div style={LogStyle} onClick={() => setIsOpen((prevOpen) => !prevOpen)}>
      <div style={{ textAlign: "left" }}>
        <div>{log.text}</div>
        <div>
          {isLastCompletedAvailable || lastCompletedLog
            ? "前回から " + intervalFromLastCompleted
            : ""}
        </div>
        <div>{"完了回数 " + completedCounts}</div>
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
        <button className="logButton add" onClick={(e) => completeLog(log, e)}>
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

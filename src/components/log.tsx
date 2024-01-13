import React, { useState } from "react";
import { deleteDocLog, addDocLogsCompleteLogs } from "../firebase";
import "../App.css";
import {
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "../types";
import { format } from "date-fns";

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
  const CompleteLogs = logsCompleteLogs.filter(
    (logsCompleteLog: LogsCompleteLogsType) => logsCompleteLog.logId === log.id
  );
  console.log(CompleteLogs);
  return (
    <div style={LogStyle} onClick={() => setIsOpen((prevOpen) => !prevOpen)}>
      <div>
        {log.text}
        {isOpen &&
          CompleteLogs.map((log: LogsCompleteLogsType, index: string) => (
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
          onClick={() => deleteDocLog(log.id)}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default Log;

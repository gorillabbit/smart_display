import React, { useEffect, useState } from "react";
import {
  deleteDocLog,
  addDocLogsCompleteLogs,
  deleteDocLogsCompleteLogs,
} from "../firebase";
import {
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "../types";
import { format, differenceInDays } from "date-fns";
import { checkLastLogCompleted } from "../utilities/dateUtilities";
import Stopwatch from "./Stopwatch";
import { Box, Button, Typography, Card } from "@mui/material";

const LogStyle = {
  backgroundColor: "#dadada",
  margin: "4px",
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

const CompleteLog = ({ completeLog, index }) => {
  return completeLog.timestamp ? (
    <Typography key={index} variant="body2" color="text.secondary">
      {format(completeLog.timestamp.toDate(), "yyyy-MM-dd HH:mm")}
    </Typography>
  ) : (
    <Box />
  );
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

  const deleteLog = (id, event) => {
    event.stopPropagation();
    deleteDocLog(id);
    completeLogs.forEach((element) => {
      deleteDocLogsCompleteLogs(element.id);
    });
  };

  return (
    <Card sx={LogStyle} onClick={() => setIsOpen((prevOpen) => !prevOpen)}>
      <Box style={{ textAlign: "left", margin: "16px" }}>
        <Typography variant="h5" textAlign="center">
          {log.text}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          visibility={isStarted ? "visible" : "hidden"}
        >
          {isStarted ? <Stopwatch /> : <div>blank</div>}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isLastCompletedAvailable || lastCompletedLog
            ? "前回から " + intervalFromLastCompleted
            : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {"今日の回数 " + todayCompletedCounts.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {"通算完了回数 " + completedCounts}
        </Typography>
        {isOpen &&
          completeLogs.map((log: LogsCompleteLogsType, index: string) => (
            <CompleteLog completeLog={log} index={index} />
          ))}
      </Box>

      <Box display="flex" width="100%">
        {log.interval && !isStarted && (
          <Button
            fullWidth
            variant="contained"
            sx={{ borderRadius: "0px" }}
            onClick={(e) => logStart(log, e)}
          >
            開始
          </Button>
        )}
        {(!log.interval || isStarted) && (
          <Button
            fullWidth
            variant="contained"
            color="success"
            sx={{ borderRadius: "0px" }}
            onClick={(e) => logComplete(log, e)}
          >
            完了
          </Button>
        )}
        <Button
          fullWidth
          variant="contained"
          color="error"
          sx={{ borderRadius: "0px" }}
          onClick={(e) => deleteLog(log.id, e)}
        >
          削除
        </Button>
      </Box>
    </Card>
  );
};

export default Log;

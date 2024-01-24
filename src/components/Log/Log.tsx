import React, { useEffect, useState } from "react";
import {
  deleteDocLog,
  addDocLogsCompleteLogs,
  deleteDocLogsCompleteLogs,
} from "../../firebase";
import {
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "../../types";
import { format, differenceInDays } from "date-fns";
import { checkLastLogCompleted } from "../../utilities/dateUtilities";
import { Box, Button, Typography, Card } from "@mui/material";
import { BodyTypography } from "../TypographyWrapper";
import Stopwatch from "./Stopwatch";
import LogHeader from "./LogHeader";
import CompleteLog from "./CompleteLog";

const LogStyle = {
  backgroundColor: "#dfdfdf",
  margin: "4px",
  positon: "absolute",
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

  const deleteLog = (
    id: string,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    deleteDocLog(id);
    completeLogs.forEach((element) => {
      deleteDocLogsCompleteLogs(element.id);
    });
  };

  return (
    <Card sx={LogStyle} onClick={() => setIsOpen((prevOpen) => !prevOpen)}>
      <LogHeader lastCompleted={lastCompleted} log={log} />
      <Box m={2} textAlign="left">
        <Typography variant="h5" textAlign="center">
          {log.text}
        </Typography>
        <BodyTypography
          visibility={isStarted ? "visible" : "hidden"}
          text={isStarted ? <Stopwatch /> : <div>blank</div>}
        />
        <BodyTypography
          text={
            isLastCompletedAvailable || lastCompletedLog
              ? "前回から " + intervalFromLastCompleted
              : ""
          }
        />
        {log.interval && (
          <BodyTypography
            text={"標準間隔 " + log.intervalNum + log.intervalUnit}
          />
        )}
        <BodyTypography text={"今日の回数 " + todayCompletedCounts.length} />
        <BodyTypography text={"通算完了回数 " + completedCounts} />
        {isOpen &&
          completeLogs.map((log: LogsCompleteLogsType, index: string) => (
            <CompleteLog completeLog={log} key={log.id} />
          ))}
      </Box>

      <Box display="flex" width="100%">
        {log.duration && !isStarted && (
          <Button
            fullWidth
            variant="contained"
            sx={{ borderRadius: "0px" }}
            onClick={(e) => logStart(log, e)}
          >
            開始
          </Button>
        )}
        {(!log.duration || isStarted) && (
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

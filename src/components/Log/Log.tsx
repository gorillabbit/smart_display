import React, { useEffect, useState } from "react";
import {
  deleteDocLog,
  addDocLogsCompleteLogs,
  deleteDocLogsCompleteLogs,
} from "../../firebase";
import { LogsCompleteLogs as LogsCompleteLogsType } from "../../types";
import { format, differenceInDays } from "date-fns";
import { checkLastLogCompleted } from "../../utilities/dateUtilities";
import { Box, Button, Typography, Card, Chip } from "@mui/material";
import { BodyTypography } from "../TypographyWrapper";
import Stopwatch from "./Stopwatch";
import LogHeader from "./LogHeader";
import CompleteLog from "./CompleteLog";
import MemoDialog from "./MemoDialog";
import ChipWrapper from "../ChipWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";

const Log = ({ log, logsCompleteLogs }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenMemoDialog, setIsOpenMemoDialog] = useState<boolean>(false);
  const [memo, setMemo] = useState<string>("");
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
      const lastLogCompleted = checkLastLogCompleted(lastCompleted) || "0分";
      setIntervalFromLastCompleted(lastLogCompleted);
      const timerId = setInterval(() => {
        setIntervalFromLastCompleted(lastLogCompleted);
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

  const logComplete = () => {
    const logsCompleteLogs = {
      logId: log.id,
      type: "finish",
      memo: memo,
    };
    addDocLogsCompleteLogs(logsCompleteLogs);
  };

  const handleLogComplete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (log.availableMemo) {
      setIsOpenMemoDialog(true);
      return;
    } else {
      logComplete();
    }
  };

  const logStart = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    const logsCompleteLogs = {
      logId: log.id,
      type: "start",
    };
    addDocLogsCompleteLogs(logsCompleteLogs);
  };

  const deleteLog = () => {
    deleteDocLog(log.id);
    completeLogs.forEach((element) => {
      deleteDocLogsCompleteLogs(element.id);
    });
  };

  return (
    <Box>
      <Card
        sx={{ backgroundColor: "#dfdfdf" }}
        onClick={() => setIsOpen((prevOpen) => !prevOpen)}
      >
        <LogHeader lastCompleted={lastCompleted} log={log} />
        <Box m={2} textAlign="left">
          <Typography variant="h5" textAlign="center">
            {log.icon && (
              <FontAwesomeIcon icon={["fas", log.icon as IconName]} />
            )}
            {log.text}
          </Typography>
          <BodyTypography
            visibility={isStarted ? "visible" : "hidden"}
            text={isStarted ? <Stopwatch log={log} /> : <div>blank</div>}
          />
          {intervalFromLastCompleted && (
            <ChipWrapper label={"前回から" + intervalFromLastCompleted} />
          )}

          {log.interval && (
            <ChipWrapper
              label={"標準間隔" + log.intervalNum + log.intervalUnit}
            />
          )}
          <ChipWrapper label={"本日" + todayCompletedCounts.length + "回"} />
          <ChipWrapper label={"通算" + completedCounts + "回"} />
          {log.availableVoiceAnnounce && (
            <ChipWrapper
              label={"音声案内 " + log.voiceAnnounceNum + log.voiceAnnounceUnit}
            />
          )}

          {isOpen &&
            completeLogs.map((log: LogsCompleteLogsType) => (
              <CompleteLog completeLog={log} key={log.id} />
            ))}
        </Box>

        <Box display="flex" width="100%">
          {log.duration && !isStarted && (
            <Button
              fullWidth
              variant="contained"
              sx={{ borderRadius: "0px" }}
              onClick={(e) => logStart(e)}
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
              onClick={(e) => handleLogComplete(e)}
            >
              完了
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            color="error"
            sx={{ borderRadius: "0px" }}
            onClick={() => deleteLog()}
          >
            削除
          </Button>
        </Box>
      </Card>
      <MemoDialog
        isOpen={isOpenMemoDialog}
        setIsOpen={setIsOpenMemoDialog}
        memo={memo}
        setMemo={setMemo}
        logComplete={logComplete}
      />
    </Box>
  );
};

export default Log;

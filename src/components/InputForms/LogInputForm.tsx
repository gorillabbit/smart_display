import {
  FormGroup,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";

import React, { useState } from "react";
import { addDocLog } from "../../firebase.js";
import { Log as LogType } from "../../types.js";
import StyledCheckbox from "./StyledCheckbox";

const defaultNewLog: LogType = {
  text: "",
  duration: false,
  interval: false,
  intervalNum: 1,
  intervalUnit: "日",
  availableMemo: false,
  availableVoiceAnnounce: false,
  voiceAnnounceNum: 1,
  voiceAnnounceUnit: "分",
};

const LogInputForm = () => {
  const [newLog, setNewLog] = useState<LogType>(defaultNewLog);

  const handleNewLogInput = (name: string, value) => {
    if (name === "intervalNum" && parseInt(value, 10) <= 0) {
      alert("0以下は入力できません。");
      return;
    }
    setNewLog((prev) => ({ ...prev, [name]: value }));
  };

  const addLog = () => {
    if (newLog) {
      addDocLog(newLog);
      setNewLog(defaultNewLog);
    }
  };

  return (
    <Box display="flex">
      <FormGroup row={true} sx={{ gap: 1, m: 1, width: "100%" }}>
        <FontAwesomeIconPicker />
        <TextField
          fullWidth
          autoFocus
          required
          label="ログ"
          value={newLog.text}
          onChange={(e) => handleNewLogInput("text", e.target.value)}
          placeholder="記録を入力"
        />
        <StyledCheckbox
          value={newLog.duration}
          handleCheckbox={() => handleNewLogInput("duration", !newLog.duration)}
        >
          スパン
        </StyledCheckbox>
        {newLog.duration && (
          <>
            <StyledCheckbox
              value={newLog.availableVoiceAnnounce}
              handleCheckbox={() =>
                handleNewLogInput(
                  "availableVoiceAnnounce",
                  !newLog.availableVoiceAnnounce
                )
              }
            >
              音声案内
            </StyledCheckbox>
            {newLog.availableVoiceAnnounce && (
              <TextField
                label="間隔"
                value={newLog.voiceAnnounceNum}
                type="number"
                onChange={(e) =>
                  handleNewLogInput("voiceAnnounceNum", e.target.value)
                }
                sx={{ maxWidth: 100 }}
              />
            )}
            {newLog.availableVoiceAnnounce && (
              <Select
                value={newLog.voiceAnnounceUnit}
                onChange={(e) =>
                  handleNewLogInput("voiceAnnounceUnit", e.target.value)
                }
              >
                <MenuItem value="秒">秒</MenuItem>
                <MenuItem value="分">分</MenuItem>
                <MenuItem value="時">時</MenuItem>
                <MenuItem value="日">日</MenuItem>
                <MenuItem value="週">週</MenuItem>
                <MenuItem value="月">月</MenuItem>
                <MenuItem value="年">年</MenuItem>
              </Select>
            )}
          </>
        )}
        <StyledCheckbox
          value={newLog.interval}
          handleCheckbox={() => handleNewLogInput("interval", !newLog.interval)}
        >
          標準間隔
        </StyledCheckbox>
        {newLog.interval && (
          <>
            <TextField
              label="間隔"
              value={newLog.intervalNum}
              type="number"
              onChange={(e) => handleNewLogInput("intervalNum", e.target.value)}
              sx={{ maxWidth: 100 }}
            />
            <Select
              value={newLog.intervalUnit}
              onChange={(e) =>
                handleNewLogInput("intervalUnit", e.target.value)
              }
            >
              <MenuItem value="秒">秒</MenuItem>
              <MenuItem value="分">分</MenuItem>
              <MenuItem value="時">時</MenuItem>
              <MenuItem value="日">日</MenuItem>
              <MenuItem value="週">週</MenuItem>
              <MenuItem value="月">月</MenuItem>
              <MenuItem value="年">年</MenuItem>
            </Select>
          </>
        )}
        <StyledCheckbox
          value={newLog.availableMemo}
          handleCheckbox={() =>
            handleNewLogInput("availableMemo", !newLog.availableMemo)
          }
        >
          完了時メモ
        </StyledCheckbox>
      </FormGroup>
      <Button sx={{ my: 1 }} variant="contained" onClick={addLog}>
        追加
      </Button>
    </Box>
  );
};

export default LogInputForm;

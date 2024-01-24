import {
  ToggleButton,
  FormGroup,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";

const LogInputForm = ({
  newTask,
  newLog,
  handleTextInput,
  handleNewLogInput,
}) => {
  return (
    <FormGroup row={true} sx={{ gap: 1, m: 1, width: "100%" }}>
      <TextField
        fullWidth
        autoFocus
        required
        label="ログ"
        value={newLog.text || newTask.text}
        onChange={(e) => handleTextInput("text", e.target.value)}
        placeholder="記録を入力"
      />
      <ToggleButton
        value="check"
        selected={newLog.duration}
        onChange={() => handleNewLogInput("duration", !newLog.duration)}
      >
        スパン
      </ToggleButton>
      <ToggleButton
        value="check"
        selected={newLog.interval}
        onChange={() => handleNewLogInput("interval", !newLog.interval)}
      >
        標準間隔
      </ToggleButton>
      {newLog.interval && (
        <TextField
          label="interval"
          value={newLog.intervalNum}
          type="number"
          onChange={(e) => handleNewLogInput("intervalNum", e.target.value)}
        />
      )}
      {newLog.interval && (
        <Select
          value={newLog.intervalUnit}
          onChange={(e) => handleNewLogInput("intervalUnit", e.target.value)}
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
    </FormGroup>
  );
};

export default LogInputForm;

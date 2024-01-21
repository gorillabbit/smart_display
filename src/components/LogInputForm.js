import { ToggleButton, FormGroup, TextField } from "@mui/material";
import "../App.css";

const LogInputForm = ({
  newTask,
  newLog,
  handleTextInput,
  handleNewLogInput,
}) => {
  console.log(newLog);
  return (
    <FormGroup row={true} sx={{ gap: 1, m: 1, width: "100%", display: "flex" }}>
      <TextField
        required
        label="ログ"
        value={newLog.text || newTask.text}
        onChange={(e) => handleTextInput("text", e.target.value)}
        placeholder="記録を入力"
        sx={{ width: "80%" }}
      />
      <ToggleButton
        sx={{ width: "18%" }}
        color="primary"
        value="check"
        selected={newLog.interval}
        onChange={() => handleNewLogInput("interval", !newLog.interval)}
      >
        スパン
      </ToggleButton>
    </FormGroup>
  );
};

export default LogInputForm;

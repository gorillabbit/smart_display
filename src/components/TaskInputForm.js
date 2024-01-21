import { MenuItem, Select, TextField, FormGroup } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

const TaskInputForm = ({ newTask, newLog, updateNewTask, handleTextInput }) => {
  return (
    <FormGroup row={true} sx={{ gap: 1, m: 1 }}>
      <TextField
        fullWidth
        required
        label="タスク"
        value={newTask.text || newLog.text}
        onChange={(value) => handleTextInput("text", value.target.value)}
      />
      <DatePicker
        label="期日-年月日"
        value={newTask.期日}
        onChange={(value) => updateNewTask("期日", value)}
      />
      <TimePicker
        ampm={false}
        label="期日-時刻"
        value={newTask.時刻}
        onChange={(value) => updateNewTask("時刻", value)}
      />
      <Select
        label="周期"
        value={newTask.is周期的}
        onChange={(value) => updateNewTask("is周期的", value.target.value)}
      >
        <MenuItem value="周期なし">周期なし</MenuItem>
        <MenuItem value="完了後に追加">完了後にタスクを追加</MenuItem>
        <MenuItem value="必ず追加">必ず追加</MenuItem>
      </Select>
      <TextField
        label="周期日数"
        type="number"
        value={newTask.周期日数}
        onChange={(value) => updateNewTask("周期日数", value.target.value)}
        disabled={newTask.is周期的 === "周期なし"}
      />
      <Select
        label="tani"
        value={newTask.周期単位}
        onChange={(value) => updateNewTask("周期単位", value.target.value)}
        disabled={newTask.is周期的 === "周期なし"}
      >
        <MenuItem value="日">日</MenuItem>
        <MenuItem value="週">週</MenuItem>
        <MenuItem value="月">月</MenuItem>
        <MenuItem value="年">年</MenuItem>
      </Select>
    </FormGroup>
  );
};

export default TaskInputForm;

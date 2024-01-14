const TaskInputForm = ({ newTask, newLog, updateNewTask, handleTextInput }) => {
  return (
    <div className="inputForm flex-grow">
      <div className="text期日Input flex-container">
        <input
          className="textInput input-field flex-grow"
          name="text"
          type="text"
          value={newTask.text || newLog.text}
          onChange={handleTextInput}
          placeholder="タスクを入力"
        />
        <p>期日</p>
        <input
          className="期日Input input-field"
          name="期日"
          type="date"
          value={newTask.期日}
          onChange={updateNewTask}
        />
        <input
          className="時刻Input input-field"
          name="時刻"
          type="time"
          value={newTask.時刻}
          onChange={updateNewTask}
        />
      </div>
      <div className="周期Input flex-end-container">
        <p>周期</p>
        <select
          className="input-field"
          name="is周期的"
          value={newTask.is周期的}
          onChange={updateNewTask}
        >
          <option value="周期なし">周期なし</option>
          <option value="完了後に追加">完了後にタスクを追加</option>
          <option value="必ず追加">必ず追加</option>
        </select>
        <input
          className="input-field"
          name="周期日数"
          type="number"
          value={newTask.周期日数}
          onChange={updateNewTask}
          disabled={newTask.is周期的 === "周期なし"}
        />
        <select
          className="input-field"
          name="周期単位"
          value={newTask.周期単位}
          onChange={updateNewTask}
          disabled={newTask.is周期的 === "周期なし"}
        >
          <option value="日">日</option>
          <option value="週">週</option>
          <option value="月">月</option>
          <option value="年">年</option>
        </select>
      </div>
    </div>
  );
};

export default TaskInputForm;

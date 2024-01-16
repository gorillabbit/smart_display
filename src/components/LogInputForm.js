import "../App.css";

const LogInputForm = ({
  newTask,
  newLog,
  handleTextInput,
  handleNewLogInput,
}) => {
  return (
    <div className="textInput flex-container">
      <input
        className="textInput input-field flex-grow"
        name="text"
        type="text"
        value={newLog.text || newTask.text}
        onChange={handleTextInput}
        placeholder="記録を入力"
      />
      <p>スパン</p>
      <input
        className="input-field"
        name="interval"
        id="interval"
        type="checkbox"
        value={newLog.interval}
        onChange={handleNewLogInput}
        style={{
          cursor: "pointer",
          position: "relative",
          width: "auto",
        }}
      />
    </div>
  );
};

export default LogInputForm;

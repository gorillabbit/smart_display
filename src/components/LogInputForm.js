const LogInputForm = ({ newTask, newLog, handleTextInput }) => {
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
    </div>
  );
};

export default LogInputForm;

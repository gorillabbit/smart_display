const OnButtonStyle = {
  backgroundColor: "#45a049",
  margin: "3px 3px 0px 3px",
};
const OffButtonStyle = {
  backgroundColor: "#b4b4b4",
  margin: "3px 3px 6px 3px",
};

const ToggleButtons = ({ isTask, setIsTask }) => {
  return (
    <div className="タスク-記録切り替えボタン" style={{ display: "flex" }}>
      <button
        className="toggleButton"
        onClick={() => setIsTask((isTask) => !isTask)}
        style={isTask ? OnButtonStyle : OffButtonStyle}
      >
        タスク
      </button>
      <button
        className="toggleButton"
        onClick={() => setIsTask((isTask) => !isTask)}
        style={!isTask ? OnButtonStyle : OffButtonStyle}
      >
        記録
      </button>
    </div>
  );
};

export default ToggleButtons;

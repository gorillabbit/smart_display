import React from "react";
import "./App.css"; // スタイルシートをインポート
import { db } from "./firebase.js";

import { updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

import { formatJapaneseDate } from "./utilities/timeFormat.js";

function getBackgroundColor(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (isNaN(diffDays)) {
    return "#F2F2F2";
  } else if (diffDays < 0) {
    return "#9C9C9C";
  } else if (diffDays < 3) {
    return "#EBBEC6"; // 期日が3日未満の場合は赤
  } else if (diffDays < 7) {
    return "#EBE0BE"; // 期日が7日未満の場合は黄色
  }
  return "#BEEBC6"; // それ以外の場合は緑
}

const tasklistStyle = {
  listStyleType: "none",
  display: "flex",
  alignItems: "stretch" /* アイテムを縦方向に伸ばす */,
  backgroundColor: "#f9f9f9",
  margin: "5px",
};

const completedTaskListStyle = {
  color: "#5f5f5f",
};

function Task({ task }) {
  console.log();
  const backgroundColor = getBackgroundColor(task.期日);
  const listStyle =
    task.completed === true
      ? { ...tasklistStyle, ...completedTaskListStyle, backgroundColor }
      : { ...tasklistStyle, backgroundColor };
  const toggleCompletion = (id, completed) => {
    try {
      const docRef = updateDoc(doc(db, "tasks", id), {
        completed: !completed,
        toggleCompletionTimestamp: serverTimestamp(),
      });
      console.log("タスク切り替え成功: ", docRef.id);
    } catch (e) {
      console.error("タスク切り替えエラー: ", e);
    }
  };

  const deleteTask = (id) => {
    try {
      const docRef = deleteDoc(doc(db, "tasks", id));
      console.log("タスク削除成功: ", docRef.id);
    } catch (e) {
      console.error("タスク削除エラー: ", e);
    }
  };

  return (
    <li
      key={task.id}
      className={task.completed ? "completed" : ""}
      style={listStyle}
    >
      <div className="task-content">
        <label className="custom-checkbox">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleCompletion(task.id, task.completed)}
          />
          <span className="checkbox-mark"></span>
        </label>
        <div style={{ display: "flex", width: "100%" }}>
          <span className="task-text" style={{ width: "100%" }}>
            {task.text}
          </span>
          <span className="task-周期" style={{ width: "100%" }}>
            {task.周期1} {task.周期2} {task.周期3}
          </span>
          {task.completed ? (
            <span style={{ width: "100%", textAlign: "right" }}>
              済 {formatJapaneseDate(task.toggleCompletionTimestamp)}
            </span>
          ) : (
            <div />
          )}
          <span style={{ width: "100%", textAlign: "right" }}>
            {task.期日 ? "期日 " : ""}
            {task.期日}
          </span>
        </div>
      </div>
      <button className="deleteButton" onClick={() => deleteTask(task.id)}>
        削除
      </button>
    </li>
  );
}

export default Task;

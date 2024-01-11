import React, { useState } from "react";
import "./App.css"; // スタイルシートをインポート
import { db } from "./firebase.js";

import {
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { format } from "date-fns";

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

function Task({ task, setTask, tasklist, type }) {
  const backgroundColor = getBackgroundColor(task.期日);
  const listStyle =
    task.completed === true
      ? { ...tasklistStyle, ...completedTaskListStyle, backgroundColor }
      : { ...tasklistStyle, backgroundColor };
  const 小taskStyle =
    type === "小タスク" ? { border: "solid 2px #ffffff" } : {};
  const is完了後追加 = task.is周期的 === "完了後に追加";
  const is必ず追加 = task.is周期的 === "必ず追加";
  const [open, setOpen] = useState(false);

  const calculateNext期日 = (task) => {
    const currentDate = new Date();
    const 周期日数 = parseInt(task.周期2);
    switch (task.周期3) {
      case "日":
        currentDate.setDate(currentDate.getDate() + 周期日数);
        break;
      case "週":
        currentDate.setDate(currentDate.getDate() + 周期日数 * 7);
        break;
      case "月":
        currentDate.setMonth(currentDate.getMonth() + 周期日数);
        break;
      case "年":
        currentDate.setFullYear(currentDate.getFullYear() + 周期日数);
        break;
      default:
        break;
    }
    return format(currentDate, "yyyy-MM-dd");
  };

  const toggleCompletion = (id, completed) => {
    try {
      updateDoc(doc(db, "tasks", id), {
        completed: !completed,
        toggleCompletionTimestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("タスク切り替えエラー: ", e);
    }

    if (completed === false && is完了後追加) {
      const newTask = {
        text: task.text,
        期日: calculateNext期日(task),
        時刻: task.時刻,
        is周期的: "完了後に追加",
        周期2: task.周期2,
        周期3: task.周期3,
        completed: false,
        親taskId: task.親taskId ?? task.id,
      };
      setTask((tasklist) => [...tasklist, newTask]);
      try {
        const docRef = addDoc(collection(db, "tasks"), {
          ...newTask,
          timestamp: serverTimestamp(),
        });
        console.log("タスク追加成功 ID: ", docRef.id);
      } catch (e) {
        console.error("タスク追加エラー: ", e);
      }
    }
  };

  const deleteTask = (id) => {
    try {
      deleteDoc(doc(db, "tasks", id));
    } catch (e) {
      console.error("タスク削除エラー: ", e);
    }
  };

  console.log(tasklist);

  const 子tasks = tasklist?.filter((listTask) => listTask.親taskId === task.id);

  const containerStyle = {
    // openの値に応じてスタイルを変更
    height: open ? "100%" : "50%", // 例として、open時に幅を100%に、そうでない場合は50%に
    transition: "width 0.3s", // スムーズなアニメーションのため
    // その他のスタイル
  };

  const handleTaskClick = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };

  return (
    <li
      key={task.id}
      className={task.completed ? "completed" : ""}
      style={{ ...listStyle, ...containerStyle, ...小taskStyle }}
      onClick={handleTaskClick}
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
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", width: "100%" }}>
            <span className="task-text" style={{ width: "100%" }}>
              {task.text}
            </span>
            <span className="task-周期" style={{ width: "100%" }}>
              周期{is完了後追加 && " タスク完了後 "} {task.周期2} {task.周期3}
            </span>
            <span style={{ width: "100%", textAlign: "right" }}>
              {task.期日 ? "期日 " : ""}
              {task.期日} {task.時刻}
            </span>
          </div>
          {open && (
            <div
              className="task-details"
              style={{ width: "100%", textAlign: "right" }}
            >
              {task.completed && task.toggleCompletionTimestamp ? (
                <span style={{ width: "100%", textAlign: "right" }}>
                  済{" "}
                  {format(
                    task.toggleCompletionTimestamp.toDate(),
                    "yyyy-MM-dd HH:mm"
                  )}
                </span>
              ) : (
                <div />
              )}
              <ul className="task-list">
                {子tasks?.map((子task) => (
                  <Task
                    type="小タスク"
                    key={子task.id}
                    task={子task}
                    setTask={setTask}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <button className="deleteButton" onClick={() => deleteTask(task.id)}>
        削除
      </button>
    </li>
  );
}

export default Task;

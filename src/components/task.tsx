import React, { useState, useEffect } from "react";
import "../App.css"; // スタイルシートをインポート
import { addDocTask, deleteDocTask, updateDocTask } from "../firebase.js";
import { calculateNext期日 } from "../utilities/dateUtilites.js";
import { getBackgroundColor } from "../utilities/taskUtilites.js";

import { serverTimestamp } from "firebase/firestore";
import TaskDetail from "./taskDetail.js";

interface TaskProps {
  task: {
    id: string;
    text: string;
    期日: string;
    時刻: string;
    completed: boolean;
    is周期的: string;
    周期2: string;
    周期3: string;
    親taskId?: string;
  };
  setTasks: React.Dispatch<React.SetStateAction<TaskProps["task"][]>>;
  tasklist?: TaskProps["task"][];
  type: string;
}

const toggleCompletion = (task, setTasks) => {
  //console.log(setTasks);
  updateDocTask(task.id, {
    completed: !task.completed,
    toggleCompletionTimestamp: serverTimestamp(),
  });

  if (task.completed === false && task.is周期的 === "完了後に追加") {
    const newTask = {
      text: task.text,
      期日: calculateNext期日(task, new Date()),
      時刻: task.時刻,
      is周期的: "完了後に追加",
      周期2: task.周期2,
      周期3: task.周期3,
      親taskId: task.親taskId ?? task.id,
    };
    setTasks((tasklist) => [...tasklist, newTask]);
    addDocTask(newTask);
  }
};

const childTaskStyle = { border: "solid 2px #ffffff" };
function ChildTasks({ tasks, setTasks }) {
  return (
    <div style={childTaskStyle}>
      子task
      {tasks.map((子task) => (
        <Task type="子task" key={子task.id} task={子task} setTasks={setTasks} />
      ))}
    </div>
  );
}

const Task: React.FC<TaskProps> = ({ task, setTasks, tasklist }) => {
  console.log(setTasks);
  const backgroundColor = getBackgroundColor(task.期日 + " " + task.時刻);

  const tasklistStyle = {
    display: "flex",
    alignItems: "stretch" /* アイテムを縦方向に伸ばす */,
    backgroundColor: task.completed ? "#c0c0c0" : backgroundColor,
    margin: "5px 0px",
    color: task.completed ? "#5f5f5f" : "",
    borderRadius: "4px",
  };

  const 子tasks = tasklist?.filter((listTask) => listTask.親taskId === task.id);
  const 親tasks = tasklist?.filter((listTask) => listTask.id === task.親taskId);

  const is完了後追加 = task.is周期的 === "完了後に追加";
  const [open, setOpen] = useState(false);

  const handleTaskClick = (event) => {
    event.stopPropagation();
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <li style={tasklistStyle} onClick={handleTaskClick}>
      <div className="task-content">
        <label className="custom-checkbox">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleCompletion(task, setTasks)}
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
          {open && <TaskDetail task={task} />}
          {open && 子tasks && 子tasks.length > 0 && (
            <ChildTasks tasks={子tasks} setTasks={setTasks} />
          )}
          {open && 親tasks && 親tasks.length > 0 && (
            <ChildTasks tasks={親tasks} setTasks={setTasks} />
          )}
        </div>
      </div>
      <button className="deleteButton" onClick={() => deleteDocTask(task.id)}>
        削除
      </button>
    </li>
  );
};

export default Task;

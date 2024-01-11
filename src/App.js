import React, { useState, useEffect } from "react";
import "./App.css"; // スタイルシートをインポート
import Clock from "./clock.js";
import Task from "./task.js";
import { db } from "./firebase.js";
import { format } from "date-fns";

import {
  orderBy,
  serverTimestamp,
  addDoc,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

const now = new Date();
const formattedDate = format(now, "yyyy-MM-dd");

const defaultNewTask = {
  text: "",
  期日: formattedDate,
  時刻: "00:00",
  is周期的: "周期なし",
  周期2: 0,
  周期3: "",
};

function App() {
  const [tasklist, setTaskList] = useState([]);
  const [unCompletedTasks, setUnCompletedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState(defaultNewTask);

  useEffect(() => {
    const tasksCollectionRef = collection(db, "tasks");
    const tasksQuery = query(
      tasksCollectionRef,
      orderBy("期日"),
      orderBy("時刻")
    );

    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(tasksData);
      setTaskList(tasksData);
      setUnCompletedTasks(tasksData.filter((data) => data.completed === false));
      setCompletedTasks(
        tasksData
          .filter((data) => data.completed === true)
          .sort((a, b) => {
            // タイムスタンプを比較して並び替え
            const dateA = a.toggleCompletionTimestamp?.toDate() ?? new Date(0);
            const dateB = b.toggleCompletionTimestamp?.toDate() ?? new Date(0);
            return dateA - dateB;
          })
      );
    });

    // コンポーネントがアンマウントされるときに購読を解除
    return () => unsubscribe();
  }, []);

  const handleNewTask = (e) => {
    setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    console.log(newTask);
  };

  const addTask = () => {
    if (newTask) {
      //周期のバリデーション
      if (newTask.is周期的 === "周期なし") {
        const { 周期2, 周期3, ...周期除外newTask } = newTask;
        setUnCompletedTasks([
          ...unCompletedTasks,
          { ...周期除外newTask, isCompleted: false },
        ]);
        try {
          const docRef = addDoc(collection(db, "tasks"), {
            ...周期除外newTask,
            completed: false,
            timestamp: serverTimestamp(),
          });
          console.log("周期なしタスク追加成功 ID: ", docRef.id);
        } catch (e) {
          console.error("周期なしタスク追加エラー: ", e);
        }
      } else {
        setUnCompletedTasks([
          ...unCompletedTasks,
          { ...newTask, isCompleted: false },
        ]);
        try {
          const docRef = addDoc(collection(db, "tasks"), {
            ...newTask,
            completed: false,
            timestamp: serverTimestamp(),
          });
          console.log("タスク追加成功 ID: ", docRef.id);
        } catch (e) {
          console.error("タスク追加エラー: ", e);
        }
      }
      setNewTask(defaultNewTask);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>TODOリスト</h1>
        <Clock />
      </div>
      <div className="flex-container">
        <div className="inputForm flex-grow">
          <div className="text期日Input flex-container">
            <input
              className="textInput input-field flex-grow"
              name="text"
              type="text"
              value={newTask.text}
              onChange={handleNewTask}
              placeholder="タスクを入力"
            />
            <p>期日</p>
            <input
              className="期日Input input-field"
              name="期日"
              type="date"
              value={newTask.期日}
              onChange={handleNewTask}
            />
            <input
              className="時刻Input input-field"
              name="時刻"
              type="time"
              value={newTask.時刻}
              onChange={handleNewTask}
            />
          </div>
          <div className="周期Input flex-end-container">
            <p>周期</p>
            <select
              className="input-field"
              name="is周期的"
              value={newTask.is周期的}
              onChange={handleNewTask}
            >
              <option value="周期なし">周期なし</option>
              <option value="完了後に追加">完了後にタスクを追加</option>
              <option value="必ず追加">必ず追加</option>
            </select>
            <input
              className="input-field"
              name="周期2"
              type="number"
              value={newTask.周期2}
              onChange={handleNewTask}
              disabled={newTask.is周期的 === "周期なし"}
            />
            <select
              className="input-field"
              name="周期3"
              value={newTask.周期3}
              onChange={handleNewTask}
              disabled={newTask.is周期的 === "周期なし"}
            >
              <option value="">-</option>
              <option value="日">日</option>
              <option value="週">週</option>
              <option value="月">月</option>
              <option value="年">年</option>
            </select>
          </div>
        </div>
        <button className="input-button" onClick={addTask}>
          {" "}
          追加
        </button>
      </div>
      <ul className="task-list">
        {unCompletedTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            setTask={setUnCompletedTasks}
            tasklist={tasklist}
          />
        ))}
      </ul>
      <ul>完了済みタスク</ul>
      <ul className="completedTaskList">
        {completedTasks.map((task) => (
          <Task key={task.id} task={task} tasklist={tasklist} />
        ))}
      </ul>
    </div>
  );
}

export default App;

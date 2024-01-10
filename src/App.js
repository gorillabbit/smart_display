import React, { useState, useEffect } from "react";
import "./App.css"; // スタイルシートをインポート
import Clock from "./clock.js";
import Task from "./task.js";
import { db } from "./firebase.js";

import {
  orderBy,
  serverTimestamp,
  addDoc,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

const defaultNewTask = {
  text: "",
  期日: new Date().toISOString().slice(0, -8),
  周期1: "",
  周期2: 0,
  周期3: "",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState(defaultNewTask);

  useEffect(() => {
    const tasksCollectionRef = collection(db, "tasks");
    const tasksQuery = query(tasksCollectionRef, orderBy("期日"));

    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(tasksData);
      setTasks(tasksData.filter((data) => data.completed === false));
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
    console.log(e);
    setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    console.log(newTask);
  };

  const addTask = () => {
    if (newTask) {
      setTasks([...tasks, { ...newTask, isCompleted: false }]);
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
      setNewTask(defaultNewTask);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>TODOリスト</h1>
        <Clock />
      </div>
      <div className="task-input">
        <input
          name="text"
          type="text"
          value={newTask.text}
          onChange={handleNewTask}
          placeholder="タスクを入力"
        />
        <input
          name="期日"
          type="datetime-local"
          value={newTask.期日}
          onChange={handleNewTask}
        />
        <select name="周期1" value={newTask.周期1} onChange={handleNewTask}>
          <option value="">-</option>
          <option value="毎">毎</option>
          <option value="隔">隔</option>
        </select>
        <input
          name="周期2"
          type="number"
          value={newTask.周期2}
          onChange={handleNewTask}
        />
        <select name="周期3" value={newTask.周期3} onChange={handleNewTask}>
          <option value="">-</option>
          <option value="日">日</option>
          <option value="週">週</option>
          <option value="月">月</option>
        </select>
        <button onClick={addTask}>追加</button>
      </div>
      <ul className="task-list">
        {tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </ul>
      <ul>完了済みタスク</ul>
      <ul className="completedTaskList">
        {completedTasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}

export default App;

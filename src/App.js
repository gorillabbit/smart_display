import React, { useState, useEffect } from "react";
import "./App.css"; // スタイルシートをインポート

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  addDoc,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import GoogleCalendar from "./calender.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("start_app");

const defaultNewTask = {
  text: "",
  期日: "",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(defaultNewTask);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (querySnapshot) => {
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
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
      setTasks([
        ...tasks,
        { text: newTask.text, isCompleted: false, 期日: newTask.期日 },
      ]);
      try {
        const docRef = addDoc(collection(db, "tasks"), {
          text: newTask,
          completed: false,
        });
        console.log("タスク追加成功 ID: ", docRef.id);
      } catch (e) {
        console.error("タスク追加エラー: ", e);
      }
      setNewTask(defaultNewTask);
    }
  };

  const toggleCompletion = (id, completed) => {
    console.log(id);
    try {
      const docRef = updateDoc(doc(db, "tasks", id), {
        completed: !completed,
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
    <div className="app">
      <div className="header">
        <h1>TODOリスト</h1>
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
          type="date"
          value={newTask.期日}
          onChange={handleNewTask}
        ></input>
        <button onClick={addTask}>追加</button>
      </div>
      <ul className="task-list">
        {tasks.map((task, index) => (
          <li key={index} className={task.isCompleted ? "completed" : ""}>
            <div className="task-content">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleCompletion(task.id, task.completed)}
                />
                <span className="checkbox-mark"></span>
              </label>
              <span className="task-text">{task.text}</span>
              <span>{task.期日}</span>
            </div>
            <button onClick={() => deleteTask(task.id)}>削除</button>
          </li>
        ))}
      </ul>
      <GoogleCalendar /> {/* GoogleCalendar コンポーネントの使用 */}
    </div>
  );
}

export default App;

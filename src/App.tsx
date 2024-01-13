import React, { useState, useEffect } from "react";
import "./App.css";
import Clock from "./components/clock.js";
import Task from "./components/task.tsx";
import { db, addDocTask } from "./firebase.js";
import { format } from "date-fns";
import { checkTaskDue, calculateNext期日 } from "./utilities/dateUtilites.js";
import { orderBy, collection, onSnapshot, query } from "firebase/firestore";
import { Task as TaskType } from "./types";

const now = new Date();
const formattedDate = format(now, "yyyy-MM-dd");

const defaultNewTask: TaskType = {
  text: "",
  期日: formattedDate,
  時刻: "00:00",
  is周期的: "周期なし",
  周期2: "0",
  周期3: "",
  completed: false,
};

function App() {
  const [tasklist, setTaskList] = useState<TaskType[]>([]);
  const [unCompletedTasks, setUnCompletedTasks] = useState<TaskType[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskType[]>([]);
  const [newTask, setNewTask] = useState<TaskType>(defaultNewTask);

  useEffect(() => {
    const tasksCollectionRef = collection(db, "tasks");
    const tasksQuery = query(
      tasksCollectionRef,
      orderBy("期日"),
      orderBy("時刻")
    );

    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData: TaskType[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        期日: doc.data().期日,
        時刻: doc.data().時刻,
        is周期的: doc.data().is周期的,
        周期2: doc.data().周期2,
        周期3: doc.data().周期3,
        completed: doc.data().completed,
        toggleCompletionTimestamp: doc.data()?.toggleCompletionTimestamp,
        親taskId: doc.data()?.親taskId,
      }));
      setTaskList(tasksData);
      console.log("tasksData", tasksData);
      setUnCompletedTasks(tasksData.filter((data) => data.completed === false));
      setCompletedTasks(
        tasksData
          .filter((data) => data.completed === true)
          .sort((a, b) => {
            // タイムスタンプを比較して並び替え
            const dateA = a.toggleCompletionTimestamp?.toDate() ?? new Date(0);
            const dateB = b.toggleCompletionTimestamp?.toDate() ?? new Date(0);
            return dateA.getTime() - dateB.getTime();
          })
      );
    });

    // コンポーネントがアンマウントされるときに購読を解除
    return () => unsubscribe();
  }, []);

  const addNewTasksIfNeeded = () => {
    const newTasks: TaskType[] = [];
    tasklist.forEach((task) => {
      if (task.is周期的 === "必ず追加" && tasklist.length !== 0) {
        const diffTime = checkTaskDue(task.期日 + " " + task.時刻);
        if (diffTime < 0) {
          const next期日 = calculateNext期日(task, new Date(task.期日));
          const 同一期日tasks = tasklist?.filter(
            (listTask) => listTask.期日 === next期日
          );
          const 子tasks = 同一期日tasks.filter(
            (同一期日task) => 同一期日task.親taskId === task.id
          );
          const 兄弟tasks = 同一期日tasks.filter(
            (同一期日task) => 同一期日task.親taskId === task.親taskId
          );
          if (子tasks.length === 0 && 兄弟tasks.length === 0) {
            const newTask = {
              text: task.text,
              期日: next期日,
              時刻: task.時刻,
              is周期的: "必ず追加",
              周期2: task.周期2,
              周期3: task.周期3,
              親taskId: task.親taskId ?? task.id,
              completed: false,
            };
            newTasks.push(newTask);
          }
        }
      }
    });
    return newTasks;
  };

  useEffect(() => {
    const newTasks = addNewTasksIfNeeded();
    if (newTasks.length > 0 && tasklist.length < 10) {
      setUnCompletedTasks((prevTasks) => [...prevTasks, ...newTasks]);
      newTasks.forEach((newTask) => {
        addDocTask(newTask);
      });
    }
  }, [tasklist]); // 依存配列に tasklist だけを含める

  const handleNewTask = (e) => {
    setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTask = () => {
    if (newTask) {
      //周期のバリデーション
      if (newTask.is周期的 === "周期なし") {
        const { 周期2, 周期3, ...周期除外newTask } = newTask;
        setUnCompletedTasks([
          ...unCompletedTasks,
          { ...周期除外newTask, completed: false },
        ]);
        addDocTask(周期除外newTask);
      } else {
        setUnCompletedTasks([
          ...unCompletedTasks,
          { ...newTask, completed: false },
        ]);
        addDocTask(newTask);
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
      <div className="content" style={{ padding: "0px 30px" }}>
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
            追加
          </button>
        </div>
        {unCompletedTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            setTasks={setUnCompletedTasks}
            tasklist={tasklist}
          />
        ))}
        <div>完了済みタスク</div>
        {completedTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            setTasks={setUnCompletedTasks}
            tasklist={tasklist}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

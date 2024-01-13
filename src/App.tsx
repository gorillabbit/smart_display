import React, { useState, useEffect } from "react";
import "./App.css";
import Clock from "./components/clock.js";
import Task from "./components/task.tsx";
import { db, addDocTask, addDocLog } from "./firebase.js";
import { format } from "date-fns";
import { checkTaskDue, calculateNext期日 } from "./utilities/dateUtilites.js";
import {
  orderBy,
  collection,
  onSnapshot,
  query,
  Timestamp,
} from "firebase/firestore";
import {
  Task as TaskType,
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "./types";
import Log from "./components/log.tsx";

const now = new Date();
const formattedDate = format(now, "yyyy-MM-dd");

const defaultNewTask: TaskType = {
  text: "",
  期日: formattedDate,
  時刻: "00:00",
  is周期的: "周期なし",
  周期2: "1",
  周期3: "日",
  completed: false,
};

const defaultNewLog: LogType = {
  text: "",
};

function App() {
  const [tasklist, setTaskList] = useState<TaskType[]>([]);
  const [unCompletedTasks, setUnCompletedTasks] = useState<TaskType[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskType[]>([]);
  const [newTask, setNewTask] = useState<TaskType>(defaultNewTask);
  const [isTask, setIsTask] = useState<boolean>(true);
  const [newLog, setNewLog] = useState<LogType>(defaultNewLog);
  const [logList, setLogList] = useState<LogType[]>([]);
  const [logsCompleteLogsList, setLogsCompleteLogsList] = useState<
    LogsCompleteLogsType[]
  >([]);

  console.log(newLog);

  useEffect(() => {
    //Taskの取得
    const tasksQuery = query(
      collection(db, "tasks"),
      orderBy("期日"),
      orderBy("時刻")
    );
    const unsubscribeTask = onSnapshot(tasksQuery, (querySnapshot) => {
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

    //Logの取得
    const unsubscribeLog = onSnapshot(
      query(collection(db, "logs")),
      (querySnapshot) => {
        const LogsData: LogType[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
        }));
        setLogList(LogsData);
      }
    );

    const logsCompleteLogsQuery = query(
      collection(db, "logsCompleteLogs"),
      orderBy("timestamp")
    );
    const unsubscribeLogsCompleteLogs = onSnapshot(
      logsCompleteLogsQuery,
      (querySnapshot) => {
        const logsCompleteLogsData: LogsCompleteLogsType[] =
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            logId: doc.data().logId,
            timestamp: doc.data().timestamp,
          }));
        setLogsCompleteLogsList(logsCompleteLogsData);
      }
    );

    // コンポーネントがアンマウントされるときに購読を解除
    return () => {
      unsubscribeTask();
      unsubscribeLog();
      unsubscribeLogsCompleteLogs();
    };
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

  const handleNewTask = (e: { target: { name: any; value: any } }) => {
    setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNewLog = (e: { target: { name: any; value: any } }) => {
    setNewLog((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTextInput = (e) => {
    handleNewTask(e);
    handleNewLog(e);
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

  const addLog = () => {
    if (newLog) {
      setLogList((logList) => [...logList, newLog]);
      addDocLog(newLog);
      setNewLog(defaultNewLog);
      setNewTask(defaultNewTask);
    }
  };

  const OnButtonStyle = {
    backgroundColor: "#45a049",
    margin: "3px 3px 0px 3px",
  };
  const OffButtonStyle = {
    backgroundColor: "#b4b4b4",
    margin: "3px 3px 6px 3px",
  };

  return (
    <div className="app">
      <div className="header">
        <h1>TODOリスト</h1>
        <Clock />
      </div>
      <div className="content" style={{ padding: "0px 30px" }}>
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
        <div className="flex-container">
          {isTask ? (
            <div className="inputForm flex-grow">
              <div className="text期日Input flex-container">
                <input
                  className="textInput input-field flex-grow"
                  name="text"
                  type="text"
                  value={newTask.text || newLog.text}
                  onChange={handleTextInput}
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
                  <option value="日">日</option>
                  <option value="週">週</option>
                  <option value="月">月</option>
                  <option value="年">年</option>
                </select>
              </div>
            </div>
          ) : (
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
          )}
          <button className="input-button" onClick={isTask ? addTask : addLog}>
            追加
          </button>
        </div>
        <div className="logList" style={{ display: "flex" }}>
          {logList.map((log) => (
            <Log log={log} logsCompleteLogs={logsCompleteLogsList} />
          ))}
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

import React, { useState } from "react";
import TaskInputForm from "./TaskInputForm.js";
import LogInputForm from "./LogInputForm.js";
import { addDocTask, addDocLog } from "../firebase.js";
import { format } from "date-fns";
import { Task as TaskType, Log as LogType } from "../types";
import ToggleButtons from "./ToggleButtons.js";
import { Button, Box } from "@mui/material";

const now = new Date();

const defaultNewTask: TaskType = {
  text: "",
  期日: now,
  時刻: now,
  is周期的: "周期なし",
  周期日数: "1",
  周期単位: "日",
  completed: false,
};

const defaultNewLog: LogType = {
  text: "",
  interval: false,
};

const InputForms = () => {
  const [newTask, setNewTask] = useState<TaskType>(defaultNewTask);
  const [isTask, setIsTask] = useState<boolean>(true);
  const [newLog, setNewLog] = useState<LogType>(defaultNewLog);

  const handleNewTaskInput = (name: string, value) => {
    if (name === "周期日数" && parseInt(value, 10) <= 0) {
      alert("0以下は入力できません。");
      return;
    }
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewLogInput = (name: string, value) => {
    setNewLog((prev) => ({ ...prev, [name]: value }));
  };

  // テキスト入力をハンドル（タスクとログの両方）
  const handleTextInput = (name: string, value) => {
    handleNewTaskInput(name, value);
    handleNewLogInput(name, value);
  };

  const validateTask = (task) => {
    return {
      ...task,
      期日: format(task.期日, "yyyy年MM月dd日"),
      時刻: format(task.時刻, "HH時mm分"),
    };
  };

  // タスクの追加
  const addTask = () => {
    if (newTask) {
      const validatedTask = validateTask(newTask);
      const taskToAdd =
        validatedTask.is周期的 === "周期なし"
          ? omitPeriodicFields(validatedTask)
          : validatedTask;
      addDocTask(taskToAdd);
      setNewTask(defaultNewTask);
      setNewLog(defaultNewLog);
    }
  };

  // 周期的なフィールドを省略
  function omitPeriodicFields(task) {
    const { 周期日数, 周期単位, ...rest } = task;
    return rest;
  }

  // ログの追加
  const addLog = () => {
    if (newLog) {
      addDocLog(newLog);
      setNewTask(defaultNewTask);
      setNewLog(defaultNewLog);
    }
  };
  return (
    <Box m={2}>
      <ToggleButtons isTask={isTask} setIsTask={setIsTask} />
      <Box display="flex">
        {isTask ? (
          <TaskInputForm
            newTask={newTask}
            newLog={newLog}
            updateNewTask={handleNewTaskInput}
            handleTextInput={handleTextInput}
          />
        ) : (
          <LogInputForm
            newTask={newTask}
            newLog={newLog}
            handleTextInput={handleTextInput}
            handleNewLogInput={handleNewLogInput}
          />
        )}
        <Button
          sx={{ my: 1 }}
          variant="contained"
          onClick={isTask ? addTask : addLog}
        >
          追加
        </Button>
      </Box>
    </Box>
  );
};

export default InputForms;

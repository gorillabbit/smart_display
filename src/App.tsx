import React from "react";

import Header from "./components/Header.js";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TaskList from "./components/TaskList.tsx";
import LogList from "./components/LogList.tsx";
import InputForms from "./components/InputForms.tsx";
import { Box } from "@mui/material";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box textAlign="center" fontFamily="Noto Sans JP">
        <Header />
        <InputForms />
        <Box m={2}>
          <LogList />
          <TaskList />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default App;

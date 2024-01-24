import React from "react";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./App.css";
import Header from "./components/Header.js";
import TaskList from "./components/Task/TaskList.tsx";
import LogList from "./components/Log/LogList.tsx";
import InputForms from "./components/InputForms/InputForms.tsx";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: [
        "Roboto",
        '"Noto Sans JP"',
        '"Helvetica"',
        "Arial",
        "sans-serif",
      ].join(","),
    },
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <Box textAlign="center">
          <Header />
          <InputForms />
          <Box m={2}>
            <LogList />
            <TaskList />
          </Box>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

import { Masonry } from "@mui/lab";
import Log from "./Log";
import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { orderBy, collection, onSnapshot, query } from "firebase/firestore";
import {
  Log as LogType,
  LogsCompleteLogs as LogsCompleteLogsType,
} from "../types";

const LogList = () => {
  const [logList, setLogList] = useState<LogType[]>([]);
  const [logsCompleteLogsList, setLogsCompleteLogsList] = useState<
    LogsCompleteLogsType[]
  >([]);

  useEffect(() => {
    //Logの取得
    const unsubscribeLog = onSnapshot(
      query(collection(db, "logs")),
      (querySnapshot) => {
        const LogsData: LogType[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          interval: doc.data().interval,
        }));
        setLogList(LogsData);
      }
    );

    const logsCompleteLogsQuery = query(
      collection(db, "logsCompleteLogs"),
      orderBy("timestamp", "desc")
    );
    const unsubscribeLogsCompleteLogs = onSnapshot(
      logsCompleteLogsQuery,
      (querySnapshot) => {
        const logsCompleteLogsData: LogsCompleteLogsType[] =
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            logId: doc.data().logId,
            timestamp: doc.data().timestamp,
            type: doc.data().type,
          }));
        setLogsCompleteLogsList(logsCompleteLogsData);
      }
    );

    // コンポーネントがアンマウントされるときに購読を解除
    return () => {
      unsubscribeLog();
      unsubscribeLogsCompleteLogs();
    };
  }, []);
  return (
    <Masonry
      sx={{ margin: "2px" }}
      columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
    >
      {logList.map((log) => (
        <Log log={log} logsCompleteLogs={logsCompleteLogsList} />
      ))}
    </Masonry>
  );
};

export default LogList;

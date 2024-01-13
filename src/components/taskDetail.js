import React from "react";
import { format } from "date-fns";

function TaskDetails({ task }) {
  // 完了タイムスタンプのフォーマット
  const completionTimestamp =
    task.completed && task.toggleCompletionTimestamp
      ? format(task.toggleCompletionTimestamp.toDate(), "yyyy-MM-dd HH:mm")
      : null;

  return (
    <div className="task-details" style={{ width: "100%", textAlign: "right" }}>
      {task.completed && (
        <span style={{ width: "100%", textAlign: "right" }}>
          済 {completionTimestamp}
        </span>
      )}
    </div>
  );
}

export default TaskDetails;

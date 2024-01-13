import { Timestamp } from "firebase/firestore";

export interface Task {
  id?: string;
  text: string;
  期日: string;
  時刻: string;
  completed: boolean;
  is周期的: string;
  周期2?: string;
  周期3?: string;
  親taskId?: string;
  toggleCompletionTimestamp?: Timestamp;
}

import { Button, Dialog, DialogActions, TextField } from "@mui/material";
import React from "react";

const MemoDialog = ({ isOpen, setIsOpen, memo, setMemo, logComplete }) => {
  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <TextField
        sx={{ m: 2 }}
        label="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      ></TextField>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={() => {
            logComplete();
            setIsOpen(false);
          }}
        >
          完了
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemoDialog;

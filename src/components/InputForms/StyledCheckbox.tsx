import { Button, Checkbox } from "@mui/material";
import React from "react";

const StyledCheckbox = ({ value, handleCheckbox, children }) => {
  return (
    <Button
      sx={{ color: "GrayText", borderColor: "GrayText" }}
      variant="outlined"
      onClick={handleCheckbox}
    >
      <Checkbox checked={value} />
      {children}
    </Button>
  );
};

export default StyledCheckbox;

import { Chip } from "@mui/material";
import React from "react";

const ChipWrapper = ({ label }) => {
  return <Chip label={label} sx={{ m: 0.2 }} size="small" />;
};

export default ChipWrapper;

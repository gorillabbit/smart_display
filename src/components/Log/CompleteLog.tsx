import { Box } from "@mui/material";
import { BodyTypography } from "../TypographyWrapper";
import React from "react";
import { format } from "date-fns";

const CompleteLog = ({ completeLog }) => {
  return completeLog.timestamp ? (
    <BodyTypography
      text={format(completeLog.timestamp.toDate(), "yyyy-MM-dd HH:mm")}
    />
  ) : (
    <Box />
  );
};

export default CompleteLog;

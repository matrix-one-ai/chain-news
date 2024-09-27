import * as React from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { Stack, Typography } from "@mui/material";

export default function LoadingBar({
  progress,
}: Readonly<{ progress: number }>) {
  return (
    <Stack sx={{ width: "100%" }}>
      <Typography
        variant="h6"
        align="right"
        sx={{
          pb: 1,
        }}
      >
        {progress.toFixed(2)}%
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Stack>
  );
}

import { Box, CircularProgress } from "@mui/material";

export default function SpinnerOverlay() {
  return (
    <Box
      position="fixed"
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex={2000}
      bgcolor="rgba(32, 24, 51, 1)"
    >
      <CircularProgress />
    </Box>
  );
}

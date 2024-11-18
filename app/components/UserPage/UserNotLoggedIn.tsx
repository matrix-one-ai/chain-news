import { Typography, Box, Stack } from "@mui/material";

const UserNotLoggedIn = () => {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        backgroundColor: "#171325",
        border: "1px solid #ffffff2b",
        borderRadius: "0.5rem",
        padding: "1rem 2rem",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h6">Please login to view your profile</Typography>
    </Stack>
  );
};

export default UserNotLoggedIn;

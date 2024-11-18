import { Chip, Stack, Typography } from "@mui/material";
import QuickreplyIcon from "@mui/icons-material/Quickreply";
import { useOverlayStore } from "../zustand/store";

const CallToAction = () => {
  const { setIsPaywallModalOpen } = useOverlayStore();

  return (
    <Stack
      sx={{
        bgcolor: "#201833",
        transition: "all 0.3s",
        p: 3,
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 3,
        position: "absolute",
        color: "white",
        top: 25,
        left: 25,
        zIndex: 1002,
        maxWidth: 450,
        cursor: "pointer",
        touchAction: "all",
        pointerEvents: "all",

        "&:hover": {
          cursor: "pointer",
          backgroundColor: "#2A1F3D",
          scale: 1.025,
        },
      }}
      onClick={() => {
        setIsPaywallModalOpen(true);
      }}
    >
      <QuickreplyIcon
        sx={{
          opacity: 0.5,
        }}
      />
      <Typography variant="h6">Chat with the hosts to get insights</Typography>
      <Chip
        label="PRO"
        sx={{
          height: 18,
          backgroundColor: "#FFB526",
          borderRadius: 0.8,
          fontWeight: "bold",
          color: "black",
        }}
      />
    </Stack>
  );
};

export default CallToAction;

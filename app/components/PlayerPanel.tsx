import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PauseIcon from "@mui/icons-material/Pause";

interface PlayerPanelProps {
  title: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onStop: () => void;
}

const PlayerPanel = ({
  title,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onStop,
}: PlayerPanelProps) => {
  return (
    <Stack
      direction="row"
      sx={{
        backgroundColor: "#201833d9",
        backdropFilter: "blur(10px)",
        padding: "0.75rem 1.25rem",
        position: "absolute",
        borderRadius: "1rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
        top: 15,
        right: 20,
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h6"
          fontSize={16}
          sx={{ color: "white", maxWidth: "30rem", letterSpacing: "1%" }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          onClick={onStop}
          sx={{
            color: "#8E899E",
            textDecoration: "underline",
            mt: 1,
            touchAction: "all",
            userSelect: "all",
            pointerEvents: "all",
            cursor: "pointer",
            fontSize: 12,

            "&:hover": {
              color: "info.main",
            },
          }}
        >
          BACK TO ALL NEWS
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
        sx={{
          touchAction: "all",
          userSelect: "all",
          pointerEvents: "all",
        }}
      >
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton
            aria-label={isPlaying ? "pause" : "play"}
            size="small"
            sx={{
              color: "#201833d9",
              backgroundColor: "error.main",

              ":hover": {
                color: "info.main",
                backgroundColor: "error.dark",
              },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Skip">
          <IconButton
            onClick={onNext}
            aria-label="skip"
            color="error"
            size="small"
            sx={{
              color: "#201833d9",
              backgroundColor: "error.main",

              ":hover": {
                color: "info.main",
                backgroundColor: "error.dark",
              },
            }}
          >
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default PlayerPanel;

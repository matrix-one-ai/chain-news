import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  useAuthStore,
  useLiveStreamStore,
  useSceneStore,
  useSettingsStore,
} from "../zustand/store";

interface SettingsModalProps {
  isPlaying: boolean;
  onStartStream: () => void;
  onStopStream: () => void;
}

const SettingsModal = ({
  isPlaying,
  onStartStream,
  onStopStream,
}: SettingsModalProps) => {
  const { isLoggedIn } = useAuthStore();

  const { isStreaming, segmentDuration, setIsStreaming, setSegmentDuration } =
    useLiveStreamStore();

  const {
    isSettingsOpen,
    isSubtitlesVisible,
    isPromptUnlocked,
    customPrompt,
    showTraderViewWidget,
    isOverlayHidden,
    setIsSettingsOpen,
    setIsSubtitlesVisible,
    setIsPromptUnlocked,
    setCustomPrompt,
    setShowTraderViewWidget,
    setIsOverlayHidden,
  } = useSettingsStore();

  const { mainHostAvatar, avatarConfigs, setMainHostAvatar } = useSceneStore();

  const onMainHostAvatarChange = (event: SelectChangeEvent) => {
    setMainHostAvatar(
      avatarConfigs.find((config) => config.name === event.target.value) as any
    );
  };

  return (
    <Modal
      open={isSettingsOpen && isLoggedIn}
      onClose={() => setIsSettingsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 800,
          width: "100%",
          bgcolor: "background.paper",
          border: "2px solid #000",
          outline: "none",
          boxShadow: 24,
          p: 4,
          color: "white",
        }}
      >
        <Typography variant="h6" component="h2">
          Settings
        </Typography>

        <Divider sx={{ my: 1 }} />

        <FormGroup>
          <FormControlLabel
            control={<Switch checked={isStreaming} />}
            onChange={() => setIsStreaming(!isStreaming)}
            label="Streamer Mode"
          />
        </FormGroup>

        {isStreaming && (
          <Box sx={{ marginTop: 2 }}>
            <Button
              variant={isPlaying ? "outlined" : "contained"}
              color="primary"
              onClick={isPlaying ? onStopStream : onStartStream}
              fullWidth
            >
              {isPlaying ? "Stop Stream" : "Start Stream"}
            </Button>
          </Box>
        )}

        <FormGroup sx={{ marginTop: 2 }}>
          <Typography gutterBottom>
            Segment Duration: {segmentDuration} minute
            {segmentDuration !== 1 && "s"}
          </Typography>
          <Slider
            value={segmentDuration}
            onChange={(e, value) => setSegmentDuration(value as number)}
            aria-labelledby="segment-duration-slider"
            valueLabelDisplay="auto"
            step={0.5}
            min={1}
            max={10}
            marks
          />
        </FormGroup>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSubtitlesVisible}
                onChange={() => setIsSubtitlesVisible(!isSubtitlesVisible)}
              />
            }
            label="Show Subtitles"
          />
        </FormGroup>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTraderViewWidget}
                onChange={() => setShowTraderViewWidget(!showTraderViewWidget)}
              />
            }
            label="Show TraderView Widget"
          />
        </FormGroup>

        <FormControl
          fullWidth
          sx={{
            my: 2,
          }}
        >
          <InputLabel id="main-host-label">Main Host Avatar</InputLabel>
          <Select
            labelId="main-host-label"
            value={mainHostAvatar.name}
            label="Main Host Avatar"
            onChange={onMainHostAvatarChange}
            size="small"
          >
            {avatarConfigs.map((config) => (
              <MenuItem key={config.vrmKey} value={config.name}>
                {config.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOverlayHidden}
                onChange={() => setIsOverlayHidden(!isOverlayHidden)}
              />
            }
            label="Hide Overlay"
          />
        </FormGroup>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPromptUnlocked}
                onChange={() => setIsPromptUnlocked(!isPromptUnlocked)}
              />
            }
            label="Unlock system prompt"
          />
        </FormGroup>

        {isPromptUnlocked && (
          <FormGroup>
            <TextField
              id="custom-prompt"
              label="Design your own prompt"
              multiline
              maxRows={8}
              variant="filled"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </FormGroup>
        )}
      </Box>
    </Modal>
  );
};

export default SettingsModal;

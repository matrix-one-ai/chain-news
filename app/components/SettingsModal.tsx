import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Modal,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useLiveStreamState } from "../zustand/store";

interface SettingsModalProps {
  isOpen: boolean;
  isPlaying: boolean;
  isSubtitlesVisible: boolean;
  isPromptUnlocked: boolean;
  customPrompt: string;
  onClose: () => void;
  onStartStream: () => void;
  onStopStream: () => void;
  onToggleSubtitles: () => void;
  onTogglePromptUnlock: () => void;
  setCustomPrompt: (customPrompt: string) => void;
}

const SettingsModal = ({
  isOpen,
  isPlaying,
  isSubtitlesVisible,
  isPromptUnlocked,
  customPrompt,
  onClose,
  onStartStream,
  onStopStream,
  onToggleSubtitles,
  onTogglePromptUnlock,
  setCustomPrompt,
}: SettingsModalProps) => {
  const { isStreaming, segmentDuration, setIsStreaming, setSegmentDuration } =
    useLiveStreamState();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
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
                onChange={onToggleSubtitles}
              />
            }
            label="Show Subtitles"
          />
        </FormGroup>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPromptUnlocked}
                onChange={onTogglePromptUnlock}
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

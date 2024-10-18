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
  Typography,
} from "@mui/material";

interface SettingsModalProps {
  isOpen: boolean;
  isStreaming: boolean;
  isPlaying: boolean;
  segmentDuration: number;
  isSubtitlesVisible: boolean;
  onClose: () => void;
  onToggleStreaming: () => void;
  onStartStream: () => void;
  onStopStream: () => void;
  onSegmentDurationChange: (segmentDuration: number) => void;
  onToggleSubtitles: () => void;
}

const SettingsModal = ({
  isOpen,
  isStreaming,
  isPlaying,
  segmentDuration,
  isSubtitlesVisible,
  onClose,
  onToggleStreaming,
  onStartStream,
  onStopStream,
  onSegmentDurationChange,
  onToggleSubtitles,
}: SettingsModalProps) => {
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
          width: 400,
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
            onChange={onToggleStreaming}
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
            onChange={(e, value) => onSegmentDurationChange(value as number)}
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
                defaultChecked
                value={isSubtitlesVisible}
                onChange={onToggleSubtitles}
              />
            }
            label="Show Subtitles"
          />
        </FormGroup>
      </Box>
    </Modal>
  );
};

export default SettingsModal;

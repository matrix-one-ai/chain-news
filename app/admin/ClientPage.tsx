// pages/admin.tsx

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
  TextField,
  Stack,
  Slider,
} from "@mui/material";
import { News } from "@prisma/client";

interface AdminPageProps {
  newsData: News[];
}

const AdminPage: React.FC<AdminPageProps> = ({ newsData }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [segmentDuration, setSegmentDuration] = useState<number>(30);

  const broadcast = useRef<BroadcastChannel | null>(null);

  const correctPassword = "matrixone";

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      broadcast.current = new BroadcastChannel("stream-control");
    }
    return () => {
      broadcast.current?.close();
    };
  }, [isAuthenticated]);

  const handleStreamStart = useCallback(() => {
    setIsPlaying(true);
    broadcast.current?.postMessage({
      type: "START_STREAM",
    });
  }, []);

  const handleStreamStop = useCallback(() => {
    setIsPlaying(false);
    broadcast.current?.postMessage({
      type: "STOP_STREAM",
    });
  }, []);

  const handleIsStreamingChange = useCallback(() => {
    setIsStreaming((prev) => !prev);
    setIsPlaying(false);
    broadcast.current?.postMessage({
      type: "SET_STREAMING",
      isStreaming: !isStreaming,
    });
  }, [isStreaming]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
    } else {
      setErrorMessage("Incorrect password. Please try again.");
    }
  };

  const handleSegmentDurationChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    setSegmentDuration(newValue as number);
    broadcast.current?.postMessage({
      type: "SET_SEGMENT_DURATION",
      segmentDuration,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.reload();
  };

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          padding: 2,
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <form onSubmit={handlePasswordSubmit}>
          <Stack spacing={4}>
            <Typography variant="h5" gutterBottom>
              Admin Login
            </Typography>
            <TextField
              type="password"
              label="Password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              sx={{
                "& .MuiInputBase-root": {
                  color: "white",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "#64b5f6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#64b5f6",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#64b5f6",
                },
              }}
            />
            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <Stack spacing={4}>
        <Typography variant="h4" gutterBottom>
          Admin Controls
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={<Switch checked={isStreaming} />}
            onChange={handleIsStreamingChange}
            label="Streamer Mode"
          />
        </FormGroup>

        {isStreaming && (
          <Box sx={{ marginTop: 2 }}>
            <Button
              variant={isPlaying ? "outlined" : "contained"}
              color="primary"
              onClick={isPlaying ? handleStreamStop : handleStreamStart}
              fullWidth
            >
              {isPlaying ? "Stop Stream" : "Start Stream"}
            </Button>
          </Box>
        )}

        <Box sx={{ marginTop: 2 }}>
          <Typography gutterBottom>
            Segment Duration: {segmentDuration} seconds
          </Typography>
          <Slider
            value={segmentDuration}
            onChange={handleSegmentDurationChange}
            aria-labelledby="segment-duration-slider"
            valueLabelDisplay="auto"
            step={1}
            min={10}
            max={300}
          />
        </Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          fullWidth
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

export default AdminPage;

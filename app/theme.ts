"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10B7FF",
    },
    secondary: {
      main: "#98F040",
    },
    success: {
      main: "#A6ED7A",
    },
    warning: {
      main: "#FFB46E",
    },
    info: {
      main: "#C9A8FF",
    },
    error: {
      main: "#AD7BFF",
    },
    background: {
      default: "#160E28",
    },
  },
  typography: {
    fontFamily: "var(--font-ibm-plex-mono)",
    h1: {
      fontFamily: "var(--font-ibm-plex-mono)",
    },
    h2: {
      fontFamily: "var(--font-ibm-plex-mono)",
    },
    h3: {
      fontFamily: "var(--font-ibm-plex-mono)",
    },
    h4: {
      fontFamily: "var(--font-ibm-plex-mono)",
    },
    h5: {
      fontFamily: "var(--font-ibm-plex-mono)",
    },
    h6: {
      fontFamily: "var(--font-ibm-plex-mono)",
    },
  },
});

export default theme;

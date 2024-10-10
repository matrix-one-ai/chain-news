import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";

const formatDate = (date: Date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName} ${day} ${month}, ${year}`;
};

const LiveBanner = () => {
  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "100%",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        touchAction: "none",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <Box
        style={{
          background:
            "linear-gradient(90deg, #200F45 0%, rgba(78, 50, 142, 0) 100%)",
          width: "100%",
          padding: "1.5rem 2rem",
          paddingBottom: "3rem",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          style={{
            borderBottom: "1.12px solid transparent",
            borderImage:
              "linear-gradient(90deg, #91ef3d 60.82%, rgba(83, 137, 35, 0) 100%)",
            borderImageSlice: 1,
          }}
        >
          <Box
            style={{
              fontFamily: "var(--font-ibm-plex-sans)",
              fontWeight: 400,
              textTransform: "uppercase",
              lineHeight: "51.25px",
              letterSpacing: "0.23em",
              color: "#a4ec78",
            }}
          >
            <Typography
              variant="body1"
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                fontWeight: 400,
                textTransform: "uppercase",
                lineHeight: "51.25px",
                letterSpacing: "0.23em",
              }}
            >
              {formatDate(new Date())}
            </Typography>
          </Box>
          <Box
            style={{
              backgroundColor: "#160e2888",
              color: "#0BC9F2",
              fontFamily: "var(--font-ibm-plex-sans)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "14.92px",
              width: "10rem",
              height: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.5rem",
              position: "relative",
            }}
          >
            <Box className="live-light" />
            <Typography
              variant="body1"
              style={{
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              LIVE STREAM
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={3}
          style={{
            paddingLeft: 0,
            alignItems: "center",
          }}
        >
          <Box
            style={{
              position: "relative",
            }}
          >
            <Box className="logo-gradient" />
            <Image
              src="/images/logo-border.svg"
              width={150}
              height={150}
              style={{
                position: "absolute",
                zIndex: 1000,
                top: -39,
                left: 2,
              }}
            />
          </Box>
          <Image
            src="/images/chain-news-watermark.svg"
            width={200}
            height={100}
            style={{
              borderLeft: "1.12px solid transparent",
              borderImage:
                "linear-gradient(180deg, #91ef3d 60.82%, rgba(83, 137, 35, 0) 100%)",
              borderImageSlice: 1,
              paddingLeft: "1rem",
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default LiveBanner;

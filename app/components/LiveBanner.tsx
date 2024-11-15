import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import Subtitle from "./Subtitle";

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

interface LiveBannerProps {
  currentSpeaker: string;
  subtitleText: string;
  isSubtitlesVisible: boolean;
}

const LiveBanner = ({
  currentSpeaker,
  subtitleText,
  isSubtitlesVisible,
}: LiveBannerProps) => {
  return (
    <Box
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 330,
        height: "100%",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {currentSpeaker && subtitleText && isSubtitlesVisible && (
        <Subtitle speaker={currentSpeaker} text={subtitleText} />
      )}

      <Box
        style={{
          background:
            "linear-gradient(90deg, #200F45 -10%, rgba(78, 50, 142, 0) 100%)",
          width: "100%",
          padding: "1.5rem 2rem",
          paddingBottom: "4rem",
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
              margin: "0.5rem",
              marginLeft: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
                gap: 1,
                padding: "0.5rem 1rem",
              }}
            >
              {/* Blinking LIVE light */}
              <Box
                sx={{
                  width: "0.5rem",
                  height: "0.5rem",
                  backgroundColor: "#a6ed7a",
                  borderRadius: "50%",
                  transform: "translateY(-50%)",
                  animation: "blink 4s infinite",
                  marginTop: "0.5rem",
                }}
              />
              <Typography
                variant="h6"
                style={{
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                }}
              >
                LIVE STREAM
              </Typography>
            </Stack>
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
            <Box
              sx={{
                height: "75px",
                width: "160px",
                borderRadius: "45px",
                zIndex: 999,
                background: "linear-gradient(275deg, #00d1ff, #98f040)",
                backgroundSize: "200% 200%",
                animation: "AnimationName 10s ease infinite",
                "@-webkit-keyframes AnimationName": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" },
                },
                "@-moz-keyframes AnimationName": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" },
                },
                "@keyframes AnimationName": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" },
                },
              }}
            />
            <Image
              src="/images/logo-border.svg"
              alt="Chain News Logo"
              width={150}
              height={150}
              style={{
                position: "absolute",
                zIndex: 1000,
                top: -37,
                left: 5,
              }}
            />
          </Box>
          <Image
            src="/images/chain-news-watermark.svg"
            alt="Chain News"
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

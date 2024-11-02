import { Stack, Box } from "@mui/material";
import Image from "next/image";
import { memo } from "react";

const WaterMark = memo(() => {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        touchAction: "none",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          scale: 0.8,
        }}
      >
        <Box
          sx={{
            height: "50px",
            width: "108px",
            borderRadius: "45px",
            zIndex: 999,
            background: "linear-gradient(210deg, #AD7BFF, #FFB46E)",
            backgroundSize: "150% 150%",
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
          width={100}
          height={90}
          style={{
            position: "absolute",
            zIndex: 1000,
            top: -20,
            left: 4,
          }}
        />
      </Box>
      <Image
        src="/images/chain-news-watermark-dark.svg"
        alt="Chain News"
        width={100}
        height={50}
      />
    </Stack>
  );
});

WaterMark.displayName = "WaterMark";

export default WaterMark;

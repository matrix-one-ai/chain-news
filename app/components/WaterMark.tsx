import { Stack, Box } from "@mui/material";
import Image from "next/image";

const WaterMark = () => {
  return (
    <Stack
      direction="row"
      spacing={3}
      style={{
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
        src="/images/chain-news-watermark-dark.svg"
        alt="Chain News"
        width={200}
        height={100}
      />
    </Stack>
  );
};

export default WaterMark;

import { Box, Typography } from "@mui/material";

interface SubTitleProps {
  speaker: string;
  text: string;
}

const Subtitle = ({ speaker, text }: SubTitleProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "25%",
        width: "100%",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#0c0a1285",

          width: "fit-content",
          padding: "0.5rem 1rem",
          backdropFilter: "blur(5px)",
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: "info.main", display: "inline" }}
        >
          {speaker}
          {": "}
          <Typography
            variant="body1"
            sx={{ color: "white", display: "inline" }}
          >
            {text}
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default Subtitle;

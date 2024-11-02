import { truncateAddress } from "@/app/helpers/crypto";
import { useAuthStore } from "@/app/zustand/store";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import Image from "next/image";
import CopyAllIcon from "@mui/icons-material/CopyAll";

const UserInfoBox = ({
  title,
  value,
  actionIcon,
  actionFunction,
}: {
  title: string;
  value: string;
  actionIcon?: React.ReactNode;
  actionFunction?: () => void;
}) => {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        backgroundColor: "#171325",
        border: "1px solid #ffffff2b",
        borderRadius: "0.5rem",
        padding: "1rem 2rem",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: "#858193",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#ffffff",
          }}
        >
          {value}
        </Typography>
      </Box>
      <IconButton
        onClick={actionFunction}
        sx={{
          touchAction: "all",
          pointerEvents: "all",
        }}
      >
        {actionIcon}
      </IconButton>
    </Stack>
  );
};

const UserSettings = () => {
  const { walletAddress } = useAuthStore();
  return (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      <Stack
        sx={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#171325",
          border: "1px solid #ffffff2b",
          borderRadius: "0.5rem",
          padding: "2rem",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Image
          src="/images/user-profile-placeholder.png"
          alt="profile"
          width={150}
          height={150}
          style={{
            borderRadius: "50%",
            border: "2px solid #AC7AFE",
          }}
        />
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: "#858193",
            textDecoration: "underline",
            touchAction: "all",
            userSelect: "none",
            pointerEvents: "all",
            cursor: "pointer",

            "&:hover": {
              color: "#AC7AFE",
            },
          }}
        >
          Change profile picture
        </Typography>
      </Stack>

      <UserInfoBox
        title="WEB3AUTH WALLET ADDRESS"
        value={truncateAddress(walletAddress || "")}
        actionIcon={<CopyAllIcon />}
        actionFunction={() => {
          navigator.clipboard.writeText(walletAddress || "");
        }}
      />

      <UserInfoBox title="NICKNAME" value={"@nickname"} />

      <UserInfoBox title="EMAIL ADDRESS" value={"123@xyz.one"} />

      <UserInfoBox title="HELIO WALLET ADDRESS" value={"-"} />
    </Stack>
  );
};

export default UserSettings;

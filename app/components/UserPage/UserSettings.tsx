import { truncateAddress } from "@/app/helpers/crypto";
import { useAuthStore } from "@/app/zustand/store";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import { upload } from "@vercel/blob/client";
import { useCallback, useRef, useState } from "react";

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
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { walletAddress, imageUrl, setImageUrl } = useAuthStore();

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        event.preventDefault();
        if (!walletAddress) {
          throw new Error("No wallet address found");
        }

        if (!inputFileRef.current?.files) {
          throw new Error("No file selected");
        }

        setIsUploadingImage(true);

        const file = inputFileRef.current.files[0];

        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/user/edit/image",
          clientPayload: walletAddress as string,
        });

        setImageUrl(newBlob.url);
        setIsUploadingImage(false);
      } catch (e) {
        console.error(e);
        setIsUploadingImage(false);
      }
    },
    [setImageUrl, walletAddress]
  );

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
          src={imageUrl || "/images/user-profile-placeholder.png"}
          alt="profile"
          width={150}
          height={150}
          style={{
            borderRadius: "50%",
            border: "2px solid #AC7AFE",
          }}
        />
        {isUploadingImage ? (
          <CircularProgress
            color="secondary"
            size="1.25rem"
            sx={{
              mt: 2,
            }}
          />
        ) : (
          <Typography
            variant="body2"
            component="label"
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
            <input
              ref={inputFileRef}
              type="file"
              style={{
                display: "none",
              }}
              onChange={handleFileUpload}
            />
          </Typography>
        )}
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

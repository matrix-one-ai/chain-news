"use client";

import { useCallback, useRef, useState } from "react";

import { truncateAddress } from "../../helpers/crypto";
import { useAuthStore } from "../../zustand/store";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

import CopyAllIcon from "@mui/icons-material/CopyAll";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UserNotLoggedIn from "./UserNotLoggedIn";

const UserInfoBox = ({
  title,
  value,
  actionIcon,
  isEditing,
  actionFunction,
  onInputChange,
}: {
  title: string;
  value: string;
  actionIcon?: React.ReactNode;
  isEditing?: boolean;
  actionFunction?: () => void;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        {isEditing ? (
          <TextField
            variant="standard"
            size="small"
            defaultValue={value}
            sx={{
              color: "#ffffff",
              "& .MuiInputBase-root": {
                color: "#ffffff",
              },
            }}
            onChange={onInputChange}
          />
        ) : (
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
            }}
          >
            {value}
          </Typography>
        )}
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

  const {
    walletAddress,
    nickname,
    imageUrl,
    email,
    isLoggedIn,
    setImageUrl,
    setNickname,
  } = useAuthStore();

  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string | null>(nickname);
  const [isNicknameLoading, setIsNicknameLoading] = useState<boolean>(false);

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
          handleUploadUrl: "/api/user/image/upload",
          clientPayload: walletAddress as string,
        });

        const editResp = await fetch("/api/user/image/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress,
            imageUrl: newBlob.url,
          }),
        });

        if (!editResp.ok) {
          throw new Error("Failed to edit image");
        }

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
      {isLoggedIn ? (
        <>
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
                    color: "primary.main",
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

          <UserInfoBox
            title="NICKNAME"
            value={nickname || "@nickname"}
            actionIcon={
              <Tooltip
                title={
                  isEditingNickname
                    ? "Save new nickname"
                    : "Change your nickname"
                }
              >
                {isNicknameLoading ? (
                  <CircularProgress size="1rem" />
                ) : isEditingNickname ? (
                  <SaveIcon />
                ) : (
                  <EditIcon />
                )}
              </Tooltip>
            }
            actionFunction={async () => {
              if (isEditingNickname && walletAddress && newNickname) {
                // Save nickname
                console.log("Saving nickname");
                setIsNicknameLoading(true);

                try {
                  const saveResp = await fetch("/api/user/nickname/edit", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      walletAddress,
                      nickname: newNickname,
                    }),
                  });

                  if (!saveResp.ok) {
                    throw new Error("Failed to save nickname");
                  }

                  setIsNicknameLoading(false);
                  setNickname(newNickname);
                  setIsEditingNickname(false);
                } catch (e) {
                  setIsNicknameLoading(false);
                  console.error(e);
                }
              } else {
                setIsEditingNickname((prev) => !prev);
              }
            }}
            onInputChange={(e) => {
              console.log(e.target.value);
              setNewNickname(e.target.value);
            }}
            isEditing={isEditingNickname}
          />

          <UserInfoBox title="EMAIL ADDRESS" value={email || "-"} />

          <UserInfoBox title="HELIO WALLET ADDRESS" value={"-"} />
        </>
      ) : (
        <>
          <UserNotLoggedIn />
        </>
      )}
    </Stack>
  );
};

export default UserSettings;

"use client";

import React, { useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  Fade,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import UserTabs from "./UserTabs";
import { ROUTE } from "@/app/constants";
import { useToggle } from "@/app/hooks/useToggle";

interface UserPageContainerProps {
  children: React.ReactNode;
}

const TITLES: { [key: string]: string } = {
  [ROUTE.USER_SETTINGS]: "User Settings",
  [ROUTE.SUBSCRIPTION]: "Subscription",
  [ROUTE.TERMS]: "Terms of Use",
  [ROUTE.PRIVACY]: "Privacy Policy",
};

const UserPageContainer: React.FC<UserPageContainerProps> = ({ children }) => {
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const pathname = usePathname();
  const [open, { toggleOn: toggleOnOpen, toggleOff: toggleOffOpen }] =
    useToggle(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    // TODO: Implement fade-out when page is unmounted?
    <Fade in>
      <Box
        ref={containerRef}
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "100%",
          width: "100%",
          backgroundColor: "#0B071A",
          zIndex: 1200,
        }}
      >
        <Stack
          direction="row"
          sx={{
            touchAction: "all",
            pointerEvents: "all",
            color: "white",
            width: "100%",
            height: "100%",
          }}
        >
          {isLandscape ? (
            <UserTabs />
          ) : (
            <>
              {!open && (
                <IconButton
                  aria-label="open-user-page-tabs"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: "white",
                    backgroundColor: "rgba(32, 24, 51, 0.6)",
                    backdropFilter: "blur(12px)",
                    width: "30px",
                    height: "30px",
                    borderRadius: "unset",

                    "@media (hover: hover)": {
                      ":hover": {
                        backgroundColor: "error.dark",
                      },
                    },
                  }}
                  onClick={toggleOnOpen}
                >
                  <MenuOutlinedIcon sx={{ width: "25px", height: "25px" }} />
                </IconButton>
              )}
              <Drawer
                container={containerRef.current}
                open={open}
                onClose={toggleOffOpen}
                sx={{
                  position: "absolute",
                  "& .MuiDrawer-paper": {
                    position: "absolute",
                    width: "365px",
                    maxWidth: "80%",
                  },
                  "& .MuiBackdrop-root": {
                    position: "absolute",
                  },
                }}
              >
                <UserTabs />
              </Drawer>
            </>
          )}
          <Box
            sx={{
              overflowY: "auto",
              width: "100%",
              height: "100%",
            }}
          >
            <Box
              sx={{
                margin: "0 auto",
                padding: "2rem",
                maxWidth: "50rem",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 3,
                  fontWeight: "bold",
                  letterSpacing: "0.1rem",
                }}
              >
                {TITLES[pathname]}
              </Typography>
              {children}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Fade>
  );
};

export default UserPageContainer;

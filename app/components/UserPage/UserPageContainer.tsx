"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  Fade,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import UserTabs from "./UserTabs";
import { ROUTE } from "@/app/constants";
import { useNavbarState } from "@/app/zustand/store";

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
  const { isUserTabsOpen, setIsUserTabsOpen, toggleIsUserTabsOpen } =
    useNavbarState();
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset tabs open state on page change
  useEffect(() => {
    setIsUserTabsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
            <Drawer
              container={containerRef.current}
              open={isUserTabsOpen}
              onClose={toggleIsUserTabsOpen}
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

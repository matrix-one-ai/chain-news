"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Box, Fade, Stack, Typography } from "@mui/material";
import UserTabs from "./UserTabs";
import { ROUTE } from "@/app/constants";

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
  const pathname = usePathname();

  return (
    // TODO: Implement fade-out when page is unmounted?
    <Fade in>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          height: "calc(100vh - 64px)",
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
          <UserTabs />
          <Box
            sx={{
              height: "calc(100vh - 64px)",
              overflowY: "auto",
              width: "100%",
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

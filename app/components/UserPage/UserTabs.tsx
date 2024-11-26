"use client";

import { useMemo } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTE } from "@/app/constants";
import { useNewsStore } from "@/app/zustand/store";

const UserTabs = () => {
  const pathname = usePathname();
  const { selectedNews } = useNewsStore();

  const tabs = useMemo(
    () => [
      {
        name: "User Settings",
        icon: <PersonIcon />,
        route: ROUTE.USER_SETTINGS,
      },
      {
        name: "Subscription",
        icon: <CreditCardIcon />,
        route: ROUTE.SUBSCRIPTION,
      },
      {
        name: "Terms of Use",
        icon: <ReceiptLongIcon />,
        route: ROUTE.TERMS,
      },
      {
        name: "Privacy Policy",
        icon: <LockIcon />,
        route: ROUTE.PRIVACY,
      },
      {
        name: "Back to ChainNews",
        icon: <ArrowBackIcon />,
        route: selectedNews?.slug
          ? `${ROUTE.HOME}?article=${selectedNews?.slug}`
          : ROUTE.HOME,
      },
    ],
    [selectedNews],
  );

  return (
    <List
      component="nav"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "365px",
        height: "100%",
        backgroundColor: "#171325",
        padding: "2rem 2rem",
      }}
    >
      {tabs.map(({ name, icon, route }, index) => (
        <Stack
          direction="column"
          key={`user-page-tab-${name}`}
          sx={{
            ...(index === tabs.length - 1 && {
              height: 0,
              flexGrow: 1,
            }),
          }}
        >
          {index === tabs.length - 1 && <Box height={0} flexGrow={1} />}
          <ListItemButton
            component={Link}
            href={route}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#3f3b52",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#494461",
              },
              "&:hover": {
                backgroundColor: "#4a465e",
              },
              backgroundColor: "#2D293C",
              mb: 1,
              width: "100%",
              borderRadius: "0.5rem",
              flexGrow: "unset",
            }}
            selected={pathname === route}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={name} />
          </ListItemButton>
        </Stack>
      ))}
    </List>
  );
};

export default UserTabs;

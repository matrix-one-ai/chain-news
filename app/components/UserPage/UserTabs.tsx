"use client";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTE } from "@/app/constants/route";

// Tabs for user page
const TABS = [
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
    route: ROUTE.HOME,
  },
];

const UserTabs = () => {
  const pathname = usePathname();

  return (
    <List
      component="nav"
      sx={{
        height: "100%",
        backgroundColor: "#171325",
        padding: "2rem 2rem",
      }}
    >
      {TABS.map(({ name, icon, route }, index) => (
        <ListItemButton
          key={`user-page-tab-${name}`}
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
            width: "18rem",
            borderRadius: "0.5rem",
            ...(index === TABS.length - 1 && {
              position: "absolute",
              bottom: "0",
              transform: "translateY(-50%)",
            }),
          }}
          selected={pathname === route}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={name} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default UserTabs;

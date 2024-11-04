import { useMemo } from "react";
import {
  Box,
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useOverlayStore, useUserPageStore } from "../../zustand/store";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UserSettings from "./UserSettings";

export enum UserPageTab {
  USER_SETTINGS,
  SUBSCRIPTION,
  TERMS_OF_USE,
  PRIVACY_POLICY,
  BACK_TO_CHAIN_NEWS,
}

const UserPage = ({}) => {
  const { isUserPageOpen, setIsUserPageOpen } = useOverlayStore();
  const { selectedUserTab, setSelectedUserTab } = useUserPageStore();

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    onClick: () => void
  ) => {
    setSelectedUserTab(index);
    onClick();
  };

  const menuItems = useMemo(
    () => [
      {
        key: UserPageTab.USER_SETTINGS,
        name: "User Settings",
        icon: <PersonIcon />,
        onClick: () => {},
      },
      {
        key: UserPageTab.SUBSCRIPTION,
        name: "Subscription",
        icon: <CreditCardIcon />,
        onClick: () => {},
      },
      {
        key: UserPageTab.TERMS_OF_USE,
        name: "Terms of Use",
        icon: <ReceiptLongIcon />,
        onClick: () => {},
      },
      {
        key: UserPageTab.PRIVACY_POLICY,
        name: "Privacy Policy",
        icon: <LockIcon />,
        onClick: () => {},
      },
      {
        key: UserPageTab.BACK_TO_CHAIN_NEWS,
        name: "Back to ChainNews",
        icon: <ArrowBackIcon />,
        onClick: () => {
          setIsUserPageOpen(false);
        },
      },
    ],
    [setIsUserPageOpen]
  );

  return (
    <Fade in={isUserPageOpen}>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          height: "calc(100vh - 64px)",
          width: "100%",
          backgroundColor: "#0B071A",
          zIndex: 2000,
        }}
      >
        <Stack
          direction="row"
          sx={{
            touchAction: "all",
            pointerEvents: "all",
            color: "white",
          }}
        >
          <List
            component="nav"
            sx={{
              backgroundColor: "#171325",
              height: "calc(100vh - 64px)",
              padding: "2rem 2rem",
            }}
          >
            {menuItems.map((item, index) => (
              <Box key={index}>
                {item.key === UserPageTab.BACK_TO_CHAIN_NEWS ? (
                  <Box sx={{ height: "calc(100vh - 64px - 20.5rem)" }} />
                ) : null}
                <ListItemButton
                  selected={selectedUserTab === index}
                  onClick={(event) => {
                    if (item.key === UserPageTab.BACK_TO_CHAIN_NEWS) {
                      item.onClick();
                      return;
                    }
                    handleListItemClick(event, index, item.onClick);
                  }}
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
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </Box>
            ))}
          </List>

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
                }}
              >
                {menuItems[selectedUserTab].name}
              </Typography>
              {menuItems[selectedUserTab].key === UserPageTab.USER_SETTINGS && (
                <UserSettings />
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Fade>
  );
};

export default UserPage;

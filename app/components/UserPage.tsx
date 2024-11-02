import { useMemo, useState } from "react";
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
import { useOverlayState } from "../zustand/store";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const UserPage = ({}) => {
  const { isUserPageOpen, setIsUserPageOpen } = useOverlayState();

  const [selectedIndex, setSelectedIndex] = useState(1);

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    onClick: () => void
  ) => {
    setSelectedIndex(index);
    onClick();
  };

  const menuItems = useMemo(
    () => [
      {
        name: "User Profile",
        icon: <PersonIcon />,
        onClick: () => {},
      },
      {
        name: "Subscription",
        icon: <CreditCardIcon />,
        onClick: () => {},
      },
      {
        name: "Terms of Use",
        icon: <ReceiptLongIcon />,
        onClick: () => {},
      },
      {
        name: "Privacy Policy",
        icon: <LockIcon />,
        onClick: () => {},
      },
      {
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
            userSelect: "all",
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
              <>
                {index === menuItems.length - 1 ? (
                  <Box sx={{ height: "calc(100vh - 64px - 20.5rem)" }} />
                ) : null}
                <ListItemButton
                  key={index}
                  selected={selectedIndex === index}
                  onClick={(event) =>
                    handleListItemClick(event, index, item.onClick)
                  }
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
              </>
            ))}
          </List>
          <Stack
            sx={{
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              padding: "2rem",
              touchAction: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <Typography variant="h4">
              {menuItems[selectedIndex].name}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
};

export default UserPage;

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WaterMark from "./WaterMark";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {
  CHAIN_NAMESPACES,
  IAdapter,
  IProvider,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { getDefaultExternalAdapters } from "@web3auth/default-solana-adapter";
import { Web3Auth } from "@web3auth/modal";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";

import RPC from "../helpers/solanaRPC";
import { useAuthStore, useNavbarState } from "../zustand/store";

import CopyAllIcon from "@mui/icons-material/CopyAll";
import { truncateAddress } from "../helpers/crypto";
import { ROUTE } from "@/app/constants";
import { usePathname, useRouter } from "next/navigation";
import { createRoot } from "react-dom/client";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

const chainConfig = {
  chainId: "0x1",
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  rpcTarget: "https://api.devnet.solana.com",
  tickerName: "SOLANA",
  ticker: "SOL",
  decimals: 9,
  blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
  logo: "https://images.toruswallet.io/sol.svg",
};

const CustomReadMore = () => (
  <Box>
    <Typography
      variant="body2"
      sx={{
        color: "#665E78",
        pt: 2,
        fontFamily: "var(--font-ibm-plex-mono)",
        fontSize: "0.8rem",
        textAlign: "center",
      }}
    >
      With the Matrix One token $MATRIX you get access to POWER UP Chain News{" "}
      <Link href="https://www.matrix.one/" target="_blank">
        <Typography
          component="span"
          sx={{
            color: "white",
            fontSize: "0.8rem",
            textDecoration: "underline",
            cursor: "pointer",
            ":hover": {
              color: "#FFD66E",
            },
            fontFamily: "var(--font-ibm-plex-mono)",
          }}
        >
          Read More
        </Typography>
      </Link>
    </Typography>
    <Divider
      sx={{
        margin: "1rem 0 !important",
        borderColor: "#5C556D",
        borderTopWidth: "0 !important",
      }}
    />
    <Typography
      variant="subtitle1"
      sx={{
        color: "white",
        textAlign: "center",
        fontFamily: "var(--font-ibm-plex-mono)",
        fontWeight: "bold",
      }}
    >
      OR SIGN IN WITH
    </Typography>

    <Typography
      variant="body1"
      sx={{
        color: "#665E78",
        textAlign: "center",
        fontSize: "0.8rem",
        fontFamily: "var(--font-ibm-plex-mono)",
      }}
    >
      A wallet will be automatically created for you.
    </Typography>
  </Box>
);

function Web3AuthLogin() {
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);

  const router = useRouter();

  const {
    walletAddress,
    isLoggedIn,
    imageUrl,
    isSubscribed,
    triggerWeb3AuthModal,
    setWalletAddress,
    setLoggedIn,
    setIsAdmin,
    setImageUrl,
    setNickname,
    setEmail,
    setIsSubscribed,
    setTriggerWeb3AuthModal,
    setSubscriptionEndTime,
    setCredits,
  } = useAuthStore();

  useEffect(() => {
    if (provider && web3auth?.connected) {
      (async () => {
        const rpc = new RPC(provider);
        const accounts = await rpc.getAccounts();
        const walletAddress = accounts[0];
        setWalletAddress(walletAddress);

        let userData = null;

        if (web3auth.connectedAdapterName === "auth") {
          userData = await web3auth.getUserInfo();
        }

        try {
          const response = await fetch("/api/web3auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress,
              chainId: chainConfig.chainId,
              chainNamespace: chainConfig.chainNamespace,
              adapter: web3auth.connectedAdapterName,
              email: userData?.email,
              nickname: userData?.name,
              typeOfLogin: userData?.typeOfLogin,
              profileImage: userData?.profileImage,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to post user info");
          }

          const data = await response.json();

          setIsAdmin(Boolean(data.isAdmin));
          setImageUrl(data.imageUrl);
          setNickname(data.nickname);
          setIsSubscribed(data.isSubscribed);
          setEmail(data.email);
          setSubscriptionEndTime(data.subscriptionEndTime);
          setCredits(data.credits);
        } catch (error) {
          console.error("Error posting user info:", error);
        }
      })();
    }
  }, [
    provider,
    web3auth?.connected,
    web3auth?.connectedAdapterName,
    setWalletAddress,
    setIsAdmin,
    setImageUrl,
    setNickname,
    setIsSubscribed,
    web3auth,
    setEmail,
    setSubscriptionEndTime,
    setCredits,
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const solanaPrivateKeyPrvoider = new SolanaPrivateKeyProvider({
          config: { chainConfig: chainConfig },
        });

        const web3auth = new Web3Auth({
          clientId,
          uiConfig: {
            appName: "Matrix One",
            mode: "dark",
            logoLight: "/images/web3auth-logo.svg",
            logoDark: "/images/web3auth-logo.svg",
            defaultLanguage: "en",
            loginGridCol: 3,
            primaryButton: "externalLogin",
            uxMode: "redirect",
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          privateKeyProvider: solanaPrivateKeyPrvoider,
        });

        const adapters = getDefaultExternalAdapters({
          options: {
            clientId,
            chainConfig,
          },
        });
        adapters.forEach((adapter: IAdapter<unknown>) => {
          if (adapter.name !== "wallet-connect-v2") {
            web3auth.configureAdapter(adapter);
          }
        });

        setWeb3auth(web3auth);

        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, [setLoggedIn]);

  const uiConsole = useCallback((...args: any[]) => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }, []);

  const login = useCallback(async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }

    // Inject custom element into Web3Auth modal
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const targetElement = document.querySelector(
            ".w3ajs-external-wallet.w3a-group",
          );
          if (targetElement) {
            const container = document.createElement("div");
            targetElement.appendChild(container);
            const root = createRoot(container);
            root.render(<CustomReadMore />);
            observer.disconnect();
          }

          // Change the text of the button
          const button = document.querySelector(
            ".w3ajs-external-toggle__button",
          );
          if (button) {
            button.textContent = "Connect with external Solana wallet";
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      setLoggedIn(true);
    }

    setProvider(web3authProvider);
  }, [web3auth, uiConsole, setLoggedIn]);

  useEffect(() => {
    if (triggerWeb3AuthModal) {
      login();
      setTriggerWeb3AuthModal(false);
    }
  }, [triggerWeb3AuthModal, login, setTriggerWeb3AuthModal]);

  const logout = useCallback(async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    setEmail("");
    setNickname("");
    setIsAdmin(false);
    setImageUrl("");
    setIsSubscribed(false);
    setSubscriptionEndTime(0);
    setCredits(0);
    router.push("/");
  }, [
    web3auth,
    setLoggedIn,
    setEmail,
    setNickname,
    setIsAdmin,
    setImageUrl,
    setIsSubscribed,
    setSubscriptionEndTime,
    setCredits,
    router,
    uiConsole,
  ]);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenUserMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setIsMenuOpen(true);
      setAnchorElUser(event.currentTarget);
    },
    [],
  );

  const handleCloseUserMenu = useCallback(() => {
    setIsMenuOpen(false);
    setAnchorElUser(null);
  }, []);

  useEffect(() => {
    setAnchorElUser(null);
    setIsMenuOpen(false);
  }, [isLoggedIn]);

  const menuItems = useMemo(
    () => [
      {
        name: "User Settings",
        route: ROUTE.USER_SETTINGS,
      },
      {
        name: "Subscription",
        route: ROUTE.SUBSCRIPTION,
      },
      {
        name: "Terms of Use",
        route: ROUTE.TERMS,
      },
      {
        name: "Privacy Policy",
        route: ROUTE.PRIVACY,
      },
      {
        name: "Logout",
        onClick: logout,
      },
    ],
    [logout],
  );

  const walletAddressClipboard = useMemo(
    () => (
      <Stack
        sx={{
          flexDirection: "row",
          backgroundColor: "#FFD66E",
          borderRadius: isLandscape ? "0.5rem" : "0",
          padding: isLandscape ? "0 0.75rem" : "0.3rem 0.75rem",
        }}
      >
        <Stack
          sx={{
            justifyContent: "center",
            flexDirection: "column",
            touchAction: "none",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{ color: "black", mr: 1, opacity: 0.5 }}
            variant="body2"
            fontSize={10}
          >
            Your address
          </Typography>
          <Typography
            sx={{ color: "black", mr: 1 }}
            variant="body2"
            fontSize={13}
          >
            {truncateAddress(walletAddress || "")}
          </Typography>
        </Stack>
        <IconButton
          onClick={() => {
            navigator.clipboard.writeText(walletAddress || "");
          }}
          size="small"
          sx={{
            color: "black",
            opacity: 0.5,
            ml: 2,
          }}
        >
          <CopyAllIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
    [walletAddress, isLandscape],
  );

  const loggedInView = (
    <Box>
      <Fade in>
        <Stack direction="row" spacing={2}>
          {isLandscape && walletAddressClipboard}
          <IconButton
            onClick={handleOpenUserMenu}
            sx={{
              p: 0,
              border: "2px solid #AC7AFE",
              pointer: "cursor",
              "&:hover": {
                backgroundColor: "#FFD66E",
              },
            }}
          >
            <Badge
              showZero
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <>
                  {isSubscribed ? (
                    <Box>
                      <Typography
                        sx={{
                          color: "black",
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: "#FFD66E",
                          borderRadius: "50%",
                          padding: "0.1rem",
                          textAlign: "center",
                        }}
                      >
                        Pro
                      </Typography>
                    </Box>
                  ) : (
                    <></>
                  )}
                </>
              }
            >
              <Avatar
                alt="Profile"
                src={imageUrl || "/images/user-profile-placeholder.png"}
                sx={{}}
              />
            </Badge>
          </IconButton>
        </Stack>
      </Fade>
      <Menu
        sx={{
          mt: "45px",
          "& .MuiList-root": {
            backgroundColor: "#171325",
            margin: "0 0",
            padding: "0 0",
          },
        }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleCloseUserMenu}
      >
        {!isLandscape && walletAddressClipboard}
        {menuItems.map(({ name, route, onClick }) => (
          <MenuItem
            key={name}
            component={route ? Link : "button"}
            href={route}
            onClick={() => {
              handleCloseUserMenu();
              onClick?.();
            }}
            sx={{
              backgroundColor: "#171325",
              padding: "0.5rem 1rem",
              textAlign: "left",
              width: "100%",
            }}
          >
            <ListItemText>{name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  const unloggedInView = (
    <Fade in>
      <Button onClick={login} color="warning" variant="contained">
        Log In
      </Button>
    </Fade>
  );

  return <Box>{isLoggedIn ? loggedInView : unloggedInView}</Box>;
}

export default function Navbar() {
  const pathname = usePathname();
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const { toggleIsUserTabsOpen } = useNavbarState();

  const isLeftMenuButtonVisible = useMemo(
    () =>
      !isLandscape &&
      (pathname === ROUTE.PRIVACY ||
        pathname === ROUTE.SUBSCRIPTION ||
        pathname === ROUTE.TERMS ||
        pathname === ROUTE.USER_SETTINGS),
    [pathname, isLandscape],
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#0C071C",
        touchAction: "all",
        userSelect: "all",
        pointerEvents: "all",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
        {isLeftMenuButtonVisible && (
          <IconButton
            aria-label="open-user-page-tabs"
            sx={{
              color: "white",
              width: "50px",
              height: "50px",
            }}
            onClick={toggleIsUserTabsOpen}
          >
            <MenuOutlinedIcon sx={{ width: "30px", height: "30px" }} />
          </IconButton>
        )}
        <WaterMark />
        <Web3AuthLogin />
      </Toolbar>
    </AppBar>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import WaterMark from "./WaterMark";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Fade,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
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
import {
  useAuthStore,
  useOverlayStore,
  useUserPageStore,
} from "../zustand/store";

import CopyAllIcon from "@mui/icons-material/CopyAll";
import { truncateAddress } from "../helpers/crypto";

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

function Web3AuthLogin() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);

  const {
    walletAddress,
    isLoggedIn,
    imageUrl,
    setWalletAddress,
    setLoggedIn,
    setIsAdmin,
    setImageUrl,
    setNickname,
  } = useAuthStore();

  useEffect(() => {
    if (provider && web3auth?.connected) {
      (async () => {
        const rpc = new RPC(provider);
        const accounts = await rpc.getAccounts();
        const walletAddress = accounts[0];
        setWalletAddress(walletAddress);

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
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to post user info");
          }

          const data = await response.json();

          setIsAdmin(Boolean(data.isAdmin));
          setImageUrl(data.imageUrl);
          setNickname(data.nickname);
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
            appName: "ChainNews.One",
            mode: "dark",
            logoLight: "https://web3auth.io/images/web3authlog.png",
            logoDark: "https://web3auth.io/images/web3authlogodark.png",
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

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      setLoggedIn(true);
    }
    setProvider(web3authProvider);
  };

  const logout = useCallback(async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  }, [web3auth, setLoggedIn, uiConsole]);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenUserMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setIsMenuOpen(true);
      setAnchorElUser(event.currentTarget);
    },
    []
  );

  const handleCloseUserMenu = useCallback(() => {
    setIsMenuOpen(false);
    setAnchorElUser(null);
  }, []);

  useEffect(() => {
    setAnchorElUser(null);
    setIsMenuOpen(false);
  }, [isLoggedIn]);

  const { setIsUserPageOpen } = useOverlayStore();
  const { setSelectedUserTab } = useUserPageStore();

  const menuItems = useMemo(
    () => [
      {
        name: "User Settings",
        onClick: () => {
          setSelectedUserTab(0);
          setIsUserPageOpen(true);
          setIsMenuOpen(false);
        },
      },
      {
        name: "Subscription",
        onClick: () => {
          setSelectedUserTab(1);
          setIsUserPageOpen(true);
          setIsMenuOpen(false);
        },
      },
      {
        name: "Terms of Use",
        onClick: () => {
          setSelectedUserTab(2);
          setIsUserPageOpen(true);
          setIsMenuOpen(false);
        },
      },
      {
        name: "Privacy Policy",
        onClick: () => {
          setSelectedUserTab(3);
          setIsUserPageOpen(true);
          setIsMenuOpen(false);
        },
      },
      {
        name: "Logout",
        onClick: logout,
      },
    ],
    [logout, setIsUserPageOpen, setSelectedUserTab]
  );

  const loggedInView = (
    <Box>
      <Fade in>
        <Stack direction="row" spacing={2}>
          <Stack
            sx={{
              flexDirection: "row",
              backgroundColor: "#FFD66E",
              borderRadius: "0.5rem",
              padding: "0 0.75rem",
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
                opacity: 0.8,
                ml: 2,
              }}
            >
              <CopyAllIcon fontSize="small" />
            </IconButton>
          </Stack>

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
            <Avatar
              alt="Profile"
              src={imageUrl || "/images/user-profile-placeholder.png"}
              sx={{}}
            />
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
        {menuItems.map((item) => (
          <MenuItem
            key={item.name}
            onClick={item.onClick}
            sx={{
              backgroundColor: "#171325",
              padding: "0.5rem 1rem",
            }}
          >
            <ListItemText sx={{ textAlign: "left" }}>{item.name}</ListItemText>
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
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#0C071C",
          touchAction: "all",
          userSelect: "all",
          pointerEvents: "all",
        }}
      >
        <Toolbar>
          <WaterMark />
          <Box sx={{ flexGrow: 1 }} />
          <Web3AuthLogin />
        </Toolbar>
      </AppBar>
    </Box>
  );
}

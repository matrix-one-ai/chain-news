"use client";

import { useEffect, useState } from "react";
import WaterMark from "./WaterMark";
import { AppBar, Box, Button, Toolbar } from "@mui/material";
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
import { useAuthStore } from "../zustand/store";

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

function truncateAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function Web3AuthLogin() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);

  const authStore = useAuthStore();

  useEffect(() => {
    if (provider && web3auth?.connected) {
      (async () => {
        const rpc = new RPC(provider);
        const accounts = await rpc.getAccounts();
        const walletAddress = accounts[0];
        authStore.setWalletAddress(walletAddress);

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
          console.log("User info posted successfully:", data);
        } catch (error) {
          console.error("Error posting user info:", error);
        }
      })();
    }
  }, [
    authStore,
    provider,
    web3auth?.connected,
    web3auth?.connectedAdapterName,
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
          authStore.setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, [authStore]);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      authStore.setLoggedIn(true);
    }
    setProvider(web3authProvider);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    authStore.setLoggedIn(false);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <Button onClick={logout} color="warning" variant="outlined">
      Log Out (
      {authStore.walletAddress ? truncateAddress(authStore.walletAddress) : ""})
    </Button>
  );

  const unloggedInView = (
    <Button onClick={login} color="warning" variant="contained">
      Login
    </Button>
  );

  return <Box>{authStore.isLoggedIn ? loggedInView : unloggedInView}</Box>;
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

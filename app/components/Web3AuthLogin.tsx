"use client";
import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";

import {
  CHAIN_NAMESPACES,
  IAdapter,
  IProvider,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { getDefaultExternalAdapters } from "@web3auth/default-solana-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { AuthAdapter } from "@web3auth/auth-adapter";

import RPC from "../helpers/ethersRPC";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

const chainConfig = {
  chainId: "0x2",
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  rpcTarget: "https://api.devnet.solana.com",
  tickerName: "SOLANA",
  ticker: "SOL",
  decimals: 9,
  blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
  logo: "https://images.toruswallet.io/sol.svg",
};

const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig },
});
const authAdapter = new AuthAdapter({ privateKeyProvider: privateKeyProvider });

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  chainConfig,
  privateKeyProvider,
};
const web3auth = new Web3Auth(web3AuthOptions);

web3auth.configureAdapter(authAdapter);

function truncateAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function Web3AuthLogin() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {
      (async () => {
        const userAddress = await RPC.getAccounts(provider);
        setAddress(userAddress);
      })();
    }
  }, [provider]);

  useEffect(() => {
    const init = async () => {
      try {
        const adapters = getDefaultExternalAdapters({
          options: web3AuthOptions,
        });
        adapters.forEach((adapter: IAdapter<unknown>) => {
          web3auth.configureAdapter(adapter);
        });
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
  }, []);

  const login = async () => {
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <Button onClick={logout}>
      Log Out ({address ? truncateAddress(address) : ""})
    </Button>
  );

  const unloggedInView = (
    <Button onClick={login} variant="outlined">
      Login
    </Button>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        top: 100,
        left: 20,
        touchAction: "all",
        userSelect: "all",
        pointerEvents: "all",
      }}
    >
      {loggedIn ? loggedInView : unloggedInView}
    </Box>
  );
}

export default Web3AuthLogin;

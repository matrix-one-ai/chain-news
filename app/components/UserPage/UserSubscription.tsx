"use client";

import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuthStore, useOverlayStore } from "../../zustand/store";
import { useCallback, useEffect, useState } from "react";
import { HelioTransaction } from "@prisma/client";
import { truncateAddress } from "../../helpers/crypto";
import UserNotLoggedIn from "./UserNotLoggedIn";

const UserSubscription = () => {
  const [transactions, setTransactions] = useState([]);

  const { isSubscribed, walletAddress, subscriptionEndTime, isLoggedIn } =
    useAuthStore();
  const { setIsPaywallModalOpen } = useOverlayStore();

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/user/transactions", {
        method: "POST",
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [fetchTransactions, walletAddress]);

  return isLoggedIn ? (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{
          textTransform: "uppercase",
          fontWeight: "bold",
          color: "text.secondary",
          letterSpacing: "0.1em",
          mb: 2,
          pt: 2,
        }}
      >
        Current Subscription
      </Typography>
      <Box
        sx={{
          backgroundColor: "#171325",
          border: "1px solid #ffffff2b",
          borderRadius: "0.5rem",
          padding: "1.5rem",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "var(--font-pixelify-sans)",
            letterSpacing: "0.1rem",
            pb: 4,
          }}
        >
          PRO.ONE
        </Typography>
        {isSubscribed ? (
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
              }}
            >
              {((transactions[0] as any)?.amount / 1000000).toFixed(3)}{" "}
              {(transactions[0] as any)?.tokenFrom}
              <Typography
                sx={{
                  color: "text.secondary",
                }}
                component={"span"}
              >
                / month
              </Typography>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                pt: 2,
                color: "text.secondary",
              }}
            >
              Active Until: {new Date(subscriptionEndTime).toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "warning.main",
              }}
            >
              Inactive Subscription
            </Typography>

            <Button
              variant="contained"
              color="warning"
              size="large"
              sx={{
                mt: 2,
                backgroundColor: "white",
                color: "#631EDC",
                fontSize: "1.1rem",
                textTransform: "capitalize",
                fontWeight: "bold",
              }}
              fullWidth
              onClick={() => {
                setIsPaywallModalOpen(true);
              }}
            >
              Subscribe Now
            </Button>
          </Box>
        )}
      </Box>

      <Typography
        variant="subtitle1"
        sx={{
          textTransform: "uppercase",
          fontWeight: "bold",
          color: "text.secondary",
          letterSpacing: "0.1em",
          mb: 2,
          pt: 3,
        }}
      >
        Transactions
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#171325",
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Wallet</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>TX Success</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions?.map((tx: HelioTransaction) => (
              <TableRow key={tx.id}>
                <TableCell>{truncateAddress(tx.senderAddress)}</TableCell>
                <TableCell>
                  {(Number(tx.amount) / 1000000).toFixed(3)} {tx.tokenFrom}
                </TableCell>
                <TableCell>
                  {(Number(tx.fee) / 1000000).toFixed(3)} {tx.tokenFrom}
                </TableCell>
                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                <TableCell>{tx.transactionSuccess}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <UserNotLoggedIn />
  );
};

export default UserSubscription;

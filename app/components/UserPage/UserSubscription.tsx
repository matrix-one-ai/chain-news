"use client";

import { HelioCheckout } from "@heliofi/checkout-react";
import { Box } from "@mui/material";

const helioConfig = {
  paylinkId: process.env.NEXT_PUBLIC_HELIO_MONTHLY_PAYLINK_ID,
  theme: { themeMode: "dark" },
  primaryColor: "#F76C1B",
  neutralColor: "#E1E6EC",
  paymentType: "paylink",
};

const UserSubscription = () => {
  return (
    <Box>
      <HelioCheckout config={helioConfig as any} />
    </Box>
  );
};

export default UserSubscription;

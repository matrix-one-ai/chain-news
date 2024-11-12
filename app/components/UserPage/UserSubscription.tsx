"use client";

import { HelioCheckout } from "@heliofi/checkout-react";
import { Box } from "@mui/material";

const helioConfig = {
  paylinkId: "6728386cf8cbaea67e0c4966",
  theme: { themeMode: "dark" },
  primaryColor: "#F76C1B",
  neutralColor: "#E1E6EC",
  paymentType: "paystream",
};

const UserSubscription = () => {
  return (
    <Box>
      <HelioCheckout config={helioConfig as any} />
    </Box>
  );
};

export default UserSubscription;

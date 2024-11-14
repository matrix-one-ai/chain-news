"use client";

import { HelioCheckout } from "@heliofi/checkout-react";
import { useMemo } from "react";
import { useAuthStore } from "../zustand/store";

interface HelioWidgetProps {
  onSuccess?: () => void;
}

const HelioWidget = ({ onSuccess }: HelioWidgetProps) => {
  const { walletAddress, setIsSubscribed } = useAuthStore();

  const helioConfig = useMemo(
    () => ({
      paylinkId: process.env.NEXT_PUBLIC_HELIO_MONTHLY_PAYLINK_ID,
      theme: { themeMode: "dark" },
      primaryColor: "#F76C1B",
      neutralColor: "#E1E6EC",
      paymentType: "paylink",
      additionalJSON: JSON.stringify({
        web3AuthAddress: walletAddress,
      }),
      onSuccess: () => {
        console.log("success");
        setIsSubscribed(true);
        onSuccess?.();
      },
    }),
    [onSuccess, setIsSubscribed, walletAddress]
  );
  return <HelioCheckout config={helioConfig as any} />;
};

export default HelioWidget;

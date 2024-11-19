"use client";

import { HelioCheckout } from "@heliofi/checkout-react";
import { useMemo } from "react";
import { useAuthStore } from "../zustand/store";

interface HelioWidgetProps {
  paylinkId: string;
  onSuccess?: () => void;
}

const HelioWidget = ({ paylinkId, onSuccess }: HelioWidgetProps) => {
  const { walletAddress, setIsSubscribed, setCredits } = useAuthStore();

  const helioConfig = useMemo(
    () => ({
      paylinkId,
      theme: { themeMode: "dark" },
      primaryColor: "#AD7BFF",
      neutralColor: "#E1E6EC",
      backgroundColor: "#0C071C",
      paymentType: "paylink",
      additionalJSON: JSON.stringify({
        web3AuthAddress: walletAddress,
      }),
      onSuccess: () => {
        console.log("success");
        setIsSubscribed(true);
        setCredits(
          paylinkId === process.env.NEXT_PUBLIC_HELIO_YEARLY_PAYLINK_ID
            ? 2000
            : 100
        );
        onSuccess?.();
      },
    }),
    [onSuccess, paylinkId, setCredits, setIsSubscribed, walletAddress]
  );
  return <HelioCheckout config={helioConfig as any} />;
};

export default HelioWidget;

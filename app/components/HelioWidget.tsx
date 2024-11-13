"use client";

import { HelioCheckout } from "@heliofi/checkout-react";
import { useMemo } from "react";

interface HelioWidgetProps {
  onSuccess?: () => void;
}

const HelioWidget = ({ onSuccess }: HelioWidgetProps) => {
  const helioConfig = useMemo(
    () => ({
      paylinkId: process.env.NEXT_PUBLIC_HELIO_MONTHLY_PAYLINK_ID,
      theme: { themeMode: "dark" },
      primaryColor: "#F76C1B",
      neutralColor: "#E1E6EC",
      paymentType: "paylink",
      onSuccess: () => {
        console.log("success");
        onSuccess?.();
      },
    }),
    [onSuccess]
  );
  return <HelioCheckout config={helioConfig as any} />;
};

export default HelioWidget;

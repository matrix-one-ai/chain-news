"use client";

import { usePathname } from "next/navigation";
import UserSubscription from "@/app/components/UserPage/UserSubscription";
import { ROUTE } from "@/app/constants/route";

export default function SubscriptionPage() {
  const pathname = usePathname();

  if (pathname === ROUTE.SUBSCRIPTION) {
    return <UserSubscription />;
  } else {
    return null;
  }
}

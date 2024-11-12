"use client";

import { usePathname } from "next/navigation";
import UserPrivacy from "@/app/components/UserPage/UserPrivacy";
import { ROUTE } from "@/app/constants/route";

export default function PrivacyPage() {
  const pathname = usePathname();

  if (pathname === ROUTE.PRIVACY) {
    return <UserPrivacy />;
  } else {
    return null;
  }
}

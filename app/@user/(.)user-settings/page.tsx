"use client";

import { usePathname } from "next/navigation";
import UserSettings from "@/app/components/UserPage/UserSettings";
import { ROUTE } from "@/app/constants/route";

export default function UserSettingsPage() {
  const pathname = usePathname();

  if (pathname === ROUTE.USER_SETTINGS) {
    return <UserSettings />;
  } else {
    return null;
  }
}

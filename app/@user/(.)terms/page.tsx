"use client";

import { usePathname } from "next/navigation";
import UserTOS from "@/app/components/UserPage/UserTOS";
import { ROUTE } from "@/app/constants";

export default function TermsPage() {
  const pathname = usePathname();

  if (pathname === ROUTE.TERMS) {
    return <UserTOS />;
  } else {
    return null;
  }
}

"use client";

import { usePathname } from "next/navigation";
import UserPageContainer from "@/app/components/UserPage/UserPageContainer";
import { ROUTE } from "@/app/constants";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === ROUTE.HOME) {
    return null;
  } else {
    return <UserPageContainer>{children}</UserPageContainer>;
  }
}

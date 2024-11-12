import UserPageContainer from "@/app/components/UserPage/UserPageContainer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserPageContainer>{children}</UserPageContainer>;
}

"use client";

import { use } from "react";
import { UserList } from "@/components/user/user-list";
import { getUserFollowing } from "@/lib/api";

export default function UserFollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const username = decodeURIComponent(use(params).username);
  return (
    <UserList title="Following" queryKey={["user", username, "following"]} fetchPage={(p) => getUserFollowing(username, p)} emptyTitle="Not following anyone yet" />
  );
}

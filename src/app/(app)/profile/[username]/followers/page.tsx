"use client";

import { use } from "react";
import { UserList } from "@/components/user/user-list";
import { getUserFollowers } from "@/lib/api";

export default function UserFollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const username = decodeURIComponent(use(params).username);
  return (
    <UserList title="Followers" queryKey={["user", username, "followers"]} fetchPage={(p) => getUserFollowers(username, p)} emptyTitle="No followers yet" />
  );
}

"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { UserList } from "@/components/user/user-list";
import { getMyFollowers } from "@/lib/api";

export default function MyFollowersPage() {
  return (
    <RequireAuth>
      <UserList title="Followers" queryKey={["me", "followers"]} fetchPage={(p) => getMyFollowers(p)} emptyTitle="No followers yet" />
    </RequireAuth>
  );
}

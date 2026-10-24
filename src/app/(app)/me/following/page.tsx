"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { UserList } from "@/components/user/user-list";
import { getMyFollowing } from "@/lib/api";

export default function MyFollowingPage() {
  return (
    <RequireAuth>
      <UserList title="Following" queryKey={["me", "following"]} fetchPage={(p) => getMyFollowing(p)} emptyTitle="You're not following anyone yet" />
    </RequireAuth>
  );
}

"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";
import type { UserItem } from "@/lib/types";
import { useAppSelector } from "@/store";

/** Baris user: avatar, nama, username, + tombol Follow (disembunyikan untuk diri sendiri). */
export function UserChip({ user, showFollow = true }: { user: UserItem; showFollow?: boolean }) {
  const meId = useAppSelector((s) => s.auth.user?.id);
  const isMe = user.isMe ?? user.id === meId;
  const href = isMe ? "/me" : `/profile/${encodeURIComponent(user.username)}`;
  return (
    <div className="flex items-center gap-3 py-2">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar src={user.avatarUrl} name={user.name} size={44} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{user.name}</span>
          <span className="block truncate text-xs text-muted">{user.username}</span>
        </span>
      </Link>
      {showFollow && !isMe && <FollowButton username={user.username} following={user.isFollowedByMe} />}
    </div>
  );
}

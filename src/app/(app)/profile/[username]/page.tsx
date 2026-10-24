"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FollowButton } from "@/components/user/follow-button";
import { PostGrid } from "@/components/post/post-grid";
import { ProfileHeader } from "@/components/profile/profile-header";
import { Tabs } from "@/components/profile/tabs";
import { ErrorState, LoadingState } from "@/components/states";
import { getUser, getUserLikes, getUserPosts } from "@/lib/api";
import { useAppSelector } from "@/store";

type Tab = "gallery" | "liked";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = use(params);
  const username = decodeURIComponent(raw);
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const [tab, setTab] = useState<Tab>("gallery");

  const q = useQuery({ queryKey: ["user", username, !!token], queryFn: () => getUser(username) });
  // Profil sendiri → arahkan ke /me.
  useEffect(() => {
    if (q.data?.isMe) router.replace("/me");
  }, [q.data?.isMe, router]);

  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data) return <ErrorState message={q.error?.message ?? "User not found"} onRetry={() => q.refetch()} />;
  const u = q.data;

  return (
    <div className="mx-auto w-full max-w-[720px] px-4">
      <ProfileHeader
        name={u.name}
        username={u.username}
        avatarUrl={u.avatarUrl}
        bio={u.bio}
        stats={{ posts: u.counts.post, followers: u.counts.followers, following: u.counts.following, likes: u.counts.likes }}
        basePath={`/profile/${encodeURIComponent(u.username)}`}
        actions={
          u.isMe ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/me/edit">Edit Profile</Link>
            </Button>
          ) : (
            <FollowButton username={u.username} following={u.isFollowing} />
          )
        }
      />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "gallery", label: "Gallery" }, { id: "liked", label: "Liked" }]} />
      <div className="mt-3">
        {tab === "gallery" ? (
          <PostGrid queryKey={["user-posts", username]} fetchPage={(p) => getUserPosts(username, p, 18)} emptyTitle="No posts yet" />
        ) : (
          <PostGrid queryKey={["user-likes", username]} fetchPage={(p) => getUserLikes(username, p, 18)} emptyTitle="No liked posts yet" />
        )}
      </div>
    </div>
  );
}

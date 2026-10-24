"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { PostGrid } from "@/components/post/post-grid";
import { ProfileHeader } from "@/components/profile/profile-header";
import { Tabs } from "@/components/profile/tabs";
import { ErrorState, LoadingState } from "@/components/states";
import { getMe, getMyLikes, getMyPosts, getMySaved } from "@/lib/api";
import { clearSession } from "@/store/auth-slice";
import { useAppDispatch } from "@/store";
import { useRouter } from "next/navigation";

type Tab = "gallery" | "saved" | "liked";

function MeContent() {
  const [tab, setTab] = useState<Tab>("gallery");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const q = useQuery({ queryKey: ["me"], queryFn: getMe });

  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data) return <ErrorState message={q.error?.message} onRetry={() => q.refetch()} />;
  const { profile, stats } = q.data;

  return (
    <div className="mx-auto w-full max-w-[720px] px-4">
      <ProfileHeader
        name={profile.name}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        bio={profile.bio}
        stats={stats}
        basePath="/me"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/me/edit">Edit Profile</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                dispatch(clearSession());
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </div>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "gallery", label: "Gallery" },
          { id: "saved", label: "Saved" },
          { id: "liked", label: "Liked" },
        ]}
      />

      <div className="mt-3">
        {tab === "gallery" && (
          <PostGrid
            queryKey={["my-posts"]}
            fetchPage={(p) => getMyPosts(p, 18)}
            emptyTitle="Your story starts here"
            emptyDescription="Share your first post and let the world see it."
            emptyAction={
              <Button asChild>
                <Link href="/add-post">Upload My First Post</Link>
              </Button>
            }
          />
        )}
        {tab === "saved" && (
          <PostGrid queryKey={["my-saved"]} fetchPage={(p) => getMySaved(p, 18)} emptyTitle="Nothing saved yet" emptyDescription="Tap the bookmark on a post to save it." />
        )}
        {tab === "liked" && (
          <PostGrid queryKey={["my-likes"]} fetchPage={(p) => getMyLikes(p, 18)} emptyTitle="No liked posts yet" emptyDescription="Posts you like will show up here." />
        )}
      </div>
    </div>
  );
}

export default function MePage() {
  return (
    <RequireAuth>
      <MeContent />
    </RequireAuth>
  );
}

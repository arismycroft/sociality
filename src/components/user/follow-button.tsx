"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAuthAction } from "@/lib/use-auth-action";
import type { PublicProfile } from "@/lib/types";

/**
 * Follow/Unfollow dengan optimistic update.
 * Status awal dari props; state optimistik disimpan di cache query "user" dan "user-list".
 */
export function FollowButton({
  username,
  following,
  className,
}: {
  username: string;
  following: boolean;
  className?: string;
}) {
  const qc = useQueryClient();
  const requireAuth = useAuthAction();

  const mutation = useMutation({
    mutationFn: (follow: boolean) => (follow ? followUser(username) : unfollowUser(username)),
    onMutate: async (follow) => {
      track(follow ? "follow" : "unfollow", { username });
      const filter = { queryKey: ["user", username] };
      await qc.cancelQueries(filter);
      const snapshot = qc.getQueriesData<PublicProfile>(filter);
      // Hanya patch cache profil (punya isFollowing); daftar followers dilewati.
      qc.setQueriesData<PublicProfile>(filter, (old) => {
        if (!old || !("isFollowing" in old) || old.isFollowing === follow) return old;
        return {
          ...old,
          isFollowing: follow,
          counts: { ...old.counts, followers: Math.max(0, old.counts.followers + (follow ? 1 : -1)) },
        };
      });
      return { snapshot };
    },
    onError: (err: Error, _f, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["user", username] });
      qc.invalidateQueries({ queryKey: ["user-list"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const optimistic = mutation.isPending ? mutation.variables : following;

  return (
    <Button
      variant={optimistic ? "outline" : "default"}
      size="sm"
      className={className}
      disabled={mutation.isPending}
      onClick={() => requireAuth(() => mutation.mutate(!optimistic))}
    >
      {optimistic ? "Following" : "Follow"}
    </Button>
  );
}

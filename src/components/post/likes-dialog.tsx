"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserChip } from "@/components/user/user-chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { getPostLikes } from "@/lib/api";

export function LikesDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const q = useInfiniteQuery({
    queryKey: ["post-likes", postId],
    enabled: open,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getPostLikes(postId, pageParam),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const users = q.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Likes">
        <div className="-mx-1 overflow-y-auto px-1">
          {q.isLoading ? (
            <LoadingState />
          ) : q.isError ? (
            <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
          ) : users.length === 0 ? (
            <EmptyState title="No likes yet" description="Be the first to like this post." />
          ) : (
            <>
              <ul className="space-y-1">
                {users.map((u) => (
                  <li key={u.id}>
                    <UserChip user={u} />
                  </li>
                ))}
              </ul>
              {q.hasNextPage && (
                <Button variant="ghost" size="sm" className="mt-2 w-full" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
                  {q.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/require-auth";
import { PostCard } from "@/components/post/post-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { getFeed } from "@/lib/api";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";

function FeedContent() {
  const q = useInfiniteQuery({
    queryKey: ["feed"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getFeed(pageParam, 10),
    // Berhenti saat page === totalPages.
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });

  const sentinel = useInfiniteScroll(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, !!q.hasNextPage);

  const posts = q.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-[600px] px-4">
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState title="Your feed is empty" description="Follow people to see their posts here." />
      ) : (
        <>
          <div className="space-y-5 pt-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          <div ref={sentinel} />
          {q.isFetchingNextPage && <LoadingState label="Loading more…" />}
          {q.isError ? null : !q.hasNextPage && <p className="py-8 text-center text-xs text-muted">You&apos;re all caught up</p>}
        </>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <RequireAuth>
      <FeedContent />
    </RequireAuth>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import type { Page, Post } from "@/lib/types";

interface Props {
  queryKey: unknown[];
  fetchPage: (page: number) => Promise<Page<Post>>;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

/** Grid 3 kolom untuk Gallery / Saved / Liked dengan infinite scroll. */
export function PostGrid({ queryKey, fetchPage, emptyTitle, emptyDescription, emptyAction }: Props) {
  const q = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const sentinel = useInfiniteScroll(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, !!q.hasNextPage);

  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState message={q.error.message} onRetry={() => q.refetch()} />;
  const posts = q.data?.pages.flatMap((p) => p.items) ?? [];
  if (posts.length === 0)
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;

  return (
    <>
      <ul className="grid grid-cols-3 gap-1 sm:gap-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`} className="relative block aspect-square overflow-hidden rounded-md bg-surface sm:rounded-lg">
              <Image src={p.imageUrl} alt={p.caption || "Post"} fill sizes="(max-width: 768px) 33vw, 250px" className="object-cover" />
            </Link>
          </li>
        ))}
      </ul>
      <div ref={sentinel} />
      {q.isFetchingNextPage && <LoadingState label="Loading more…" />}
    </>
  );
}

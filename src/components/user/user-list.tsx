"use client";

import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { UserChip } from "./user-chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import type { Page, UserItem } from "@/lib/types";

/** Halaman daftar user (followers / following) dengan infinite scroll. */
export function UserList({
  title,
  queryKey,
  fetchPage,
  emptyTitle,
}: {
  title: string;
  queryKey: unknown[];
  fetchPage: (page: number) => Promise<Page<UserItem>>;
  emptyTitle: string;
}) {
  const router = useRouter();
  const q = useInfiniteQuery({
    queryKey: ["user-list", ...queryKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const sentinel = useInfiniteScroll(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, !!q.hasNextPage);
  const users = q.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-4">
      <div className="mb-3 flex items-center gap-3">
        <button type="button" aria-label="Back" onClick={() => router.back()}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                <UserChip user={u} />
              </li>
            ))}
          </ul>
          <div ref={sentinel} />
          {q.isFetchingNextPage && <LoadingState label="Loading more…" />}
        </>
      )}
    </div>
  );
}

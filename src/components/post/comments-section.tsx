"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "./emoji-picker";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { addComment, deleteComment, getComments } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAuthAction } from "@/lib/use-auth-action";
import { timeAgo } from "@/lib/utils";
import { useAppSelector } from "@/store";
import type { Comment, Page, Post } from "@/lib/types";

type Infinite = { pages: Page<Comment>[]; pageParams: unknown[] };

export function CommentsSection({ post }: { post: Post }) {
  const qc = useQueryClient();
  const me = useAppSelector((s) => s.auth.user);
  const requireAuth = useAuthAction();
  const [text, setText] = useState("");
  const key = ["comments", post.id];

  const q = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getComments(post.id, pageParam, 10),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const comments = q.data?.pages.flatMap((p) => p.items) ?? [];

  const bumpCount = (delta: number) =>
    qc.setQueriesData<Post>({ queryKey: ["post", post.id] }, (old) =>
      old ? { ...old, commentCount: Math.max(0, (old.commentCount ?? 0) + delta) } : old,
    );

  const add = useMutation({
    mutationFn: (t: string) => addComment(post.id, t),
    onMutate: async (t) => {
      track("comment_submit", { postId: post.id });
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Infinite>(key);
      const temp: Comment = {
        id: -Date.now(),
        text: t,
        createdAt: new Date().toISOString(),
        author: { id: me!.id, username: me!.username, name: me!.name, avatarUrl: me!.avatarUrl },
        isMine: true,
      };
      qc.setQueryData<Infinite>(key, (old) => {
        if (!old) return old;
        const [first, ...rest] = old.pages;
        return { ...old, pages: [{ ...first, items: [temp, ...first.items] }, ...rest] };
      });
      bumpCount(1);
      setText("");
      return { prev, t };
    },
    onError: (err: Error, _t, ctx) => {
      qc.setQueryData(key, ctx?.prev);
      bumpCount(-1);
      if (ctx) setText(ctx.t);
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Infinite>(key);
      qc.setQueryData<Infinite>(key, (old) =>
        old
          ? { ...old, pages: old.pages.map((pg) => ({ ...pg, items: pg.items.filter((c) => c.id !== id) })) }
          : old,
      );
      bumpCount(-1);
      return { prev };
    },
    onError: (err: Error, _id, ctx) => {
      qc.setQueryData(key, ctx?.prev);
      bumpCount(1);
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || add.isPending) return;
    requireAuth(() => add.mutate(t));
  };

  // Boleh hapus: komentar sendiri atau komentar di post milik sendiri.
  const canDelete = (c: Comment) =>
    !!me && c.id > 0 && (c.isMine || c.author.id === me.id || post.author?.id === me.id);

  return (
    <section aria-label="Comments" className="flex min-h-0 flex-1 flex-col">
      <h2 className="mb-3 font-bold">Comments</h2>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {q.isLoading ? (
          <LoadingState />
        ) : q.isError ? (
          <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
        ) : comments.length === 0 ? (
          <EmptyState title="No comments yet" description="Start the conversation." />
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <Link href={c.author.id === me?.id ? "/me" : `/profile/${encodeURIComponent(c.author.username)}`}>
                  <Avatar src={c.author.avatarUrl} name={c.author.name} size={40} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{c.author.name}</span>{" "}
                    <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
                  </p>
                  <p className="break-words text-sm">{c.text}</p>
                </div>
                {canDelete(c) && (
                  <button
                    type="button"
                    aria-label="Delete comment"
                    className="self-start text-muted hover:text-danger"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(c.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {q.hasNextPage && (
          <Button variant="ghost" size="sm" className="mt-3 w-full" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
            {q.isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <EmojiPicker onPick={(e) => setText((t) => t + e)} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Add Comment"
          aria-label="Add comment"
          className="h-11 min-w-0 flex-1 rounded-pill border border-border bg-black px-4 text-sm placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <Button type="submit" size="sm" disabled={!text.trim() || add.isPending}>
          Post
        </Button>
      </form>
    </section>
  );
}

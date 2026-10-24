"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMySaved, likePost, savePost, unlikePost, unsavePost } from "./api";
import type { Page, Post } from "./types";
import { track } from "./analytics";
import { useAppSelector } from "@/store";

/** Kunci query yang berisi daftar/detail post (dipatch saat optimistic update). */
const POST_KEYS = ["feed", "post", "my-posts", "user-posts", "my-likes", "user-likes"];

type Infinite = { pages: Page<Post>[]; pageParams: unknown[] };

function patchPost(qc: QueryClient, id: number, fn: (p: Post) => Post) {
  qc.setQueriesData(
    { predicate: (q) => POST_KEYS.includes(q.queryKey[0] as string) },
    (old: unknown) => {
      if (!old || typeof old !== "object") return old;
      const o = old as Infinite | Post;
      if ("pages" in o) {
        return {
          ...o,
          pages: o.pages.map((pg) => ({
            ...pg,
            items: pg.items.map((p) => (p.id === id ? fn(p) : p)),
          })),
        };
      }
      return "id" in o && o.id === id ? fn(o) : old;
    },
  );
}

/** Set id post yang di-save. API tidak punya flag saved di feed/detail → ambil dari /api/me/saved. */
export function useSavedIds() {
  const token = useAppSelector((s) => s.auth.token);
  return useQuery({
    queryKey: ["saved-ids"],
    enabled: !!token,
    queryFn: async () => {
      const ids = new Set<number>();
      let page = 1;
      for (;;) {
        const res = await getMySaved(page, 100);
        res.items.forEach((p) => ids.add(p.id));
        if (page >= res.pagination.totalPages) break;
        page += 1;
      }
      return ids;
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, like }: { id: number; like: boolean }) =>
      like ? likePost(id) : unlikePost(id),
    onMutate: async ({ id, like }) => {
      track(like ? "like" : "unlike", { postId: id });
      const snapshot = qc.getQueriesData({
        predicate: (q) => POST_KEYS.includes(q.queryKey[0] as string),
      });
      // Idempotent: hanya ubah counter jika status benar-benar berubah.
      patchPost(qc, id, (p) =>
        !!p.likedByMe === like
          ? p
          : { ...p, likedByMe: like, likeCount: Math.max(0, (p.likeCount ?? 0) + (like ? 1 : -1)) },
      );
      return { snapshot };
    },
    onError: (err: Error, _v, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(err.message);
    },
    onSettled: (_d, _e, { id }) => {
      qc.invalidateQueries({ queryKey: ["post", id] });
      qc.invalidateQueries({ queryKey: ["post-likes", id] });
      qc.invalidateQueries({ queryKey: ["my-likes"] });
    },
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, save }: { id: number; save: boolean }) =>
      save ? savePost(id) : unsavePost(id),
    onMutate: async ({ id, save }) => {
      track(save ? "save" : "unsave", { postId: id });
      await qc.cancelQueries({ queryKey: ["saved-ids"] });
      const prev = qc.getQueryData<Set<number>>(["saved-ids"]);
      const next = new Set(prev ?? []);
      if (save) next.add(id);
      else next.delete(id);
      qc.setQueryData(["saved-ids"], next);
      return { prev };
    },
    onError: (err: Error, _v, ctx) => {
      qc.setQueryData(["saved-ids"], ctx?.prev);
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["saved-ids"] });
      qc.invalidateQueries({ queryKey: ["my-saved"] });
    },
  });
}

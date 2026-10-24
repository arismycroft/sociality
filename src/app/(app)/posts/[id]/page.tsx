"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, Heart, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommentsSection } from "@/components/post/comments-section";
import { LikesDialog } from "@/components/post/likes-dialog";
import { ErrorState, LoadingState } from "@/components/states";
import { deletePost, getPost } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAuthAction } from "@/lib/use-auth-action";
import { useSavedIds, useToggleLike, useToggleSave } from "@/lib/use-post-actions";
import { cn, timeAgo } from "@/lib/utils";
import { useAppSelector } from "@/store";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = use(params);
  const id = Number(rawId);
  const router = useRouter();
  const qc = useQueryClient();
  const me = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const requireAuth = useAuthAction();
  const [likesOpen, setLikesOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // token ikut di key supaya detail di-fetch ulang (likedByMe benar) setelah login.
  const q = useQuery({ queryKey: ["post", id, !!token], queryFn: () => getPost(id), enabled: Number.isFinite(id) });
  const like = useToggleLike();
  const save = useToggleSave();
  const { data: savedIds } = useSavedIds();

  const del = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["my-posts"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/me");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (Number.isFinite(id)) track("view_post", { postId: id });
  }, [id]);

  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data) return <ErrorState message={q.error?.message ?? "Post not found"} onRetry={() => q.refetch()} />;

  const post = q.data;
  const liked = !!post.likedByMe;
  const saved = !!savedIds?.has(post.id);
  const isOwner = !!me && post.author?.id === me.id;

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-4">
      <button type="button" onClick={() => router.back()} className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-white">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
          <Image src={post.imageUrl} alt={post.caption || "Post image"} fill priority sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
        </div>

        <div className="flex min-h-0 flex-col md:max-h-[600px]">
          {post.author && (
            <header className="flex items-center gap-3 pb-3">
              <Link href={post.author.id === me?.id ? "/me" : `/profile/${encodeURIComponent(post.author.username)}`}>
                <Avatar src={post.author.avatarUrl} name={post.author.name} size={44} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{post.author.name}</p>
                <p className="text-xs text-muted">{timeAgo(post.createdAt)}</p>
              </div>
              {isOwner && (
                <button type="button" aria-label="Delete post" className="text-muted hover:text-danger" onClick={() => setConfirmOpen(true)}>
                  <Trash2 size={20} />
                </button>
              )}
            </header>
          )}
          {post.caption && <p className="pb-3 text-sm">{post.caption}</p>}

          <div className="flex items-center gap-4 border-y border-border py-3">
            <button
              type="button"
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              onClick={() => requireAuth(() => like.mutate({ id: post.id, like: !liked }))}
            >
              <Heart size={24} className={cn(liked && "fill-danger text-danger")} />
            </button>
            <button type="button" className="text-sm" onClick={() => setLikesOpen(true)}>
              {post.likeCount ?? 0}
            </button>
            <span className="flex items-center gap-1.5 text-sm">
              <MessageCircle size={24} /> {post.commentCount ?? 0}
            </span>
            <button
              type="button"
              className="ml-auto"
              aria-pressed={saved}
              aria-label={saved ? "Unsave" : "Save"}
              onClick={() => requireAuth(() => save.mutate({ id: post.id, save: !saved }))}
            >
              <Bookmark size={24} className={cn(saved && "fill-white")} />
            </button>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <CommentsSection post={post} />
          </div>
        </div>
      </div>

      <LikesDialog postId={post.id} open={likesOpen} onOpenChange={setLikesOpen} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent title="Delete post?" className="max-w-[360px]">
          <p className="text-sm text-muted">This post will be removed permanently.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={del.isPending} onClick={() => del.mutate()}>
              {del.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

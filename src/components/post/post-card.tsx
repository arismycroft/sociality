"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { LikesDialog } from "./likes-dialog";
import { cn, timeAgo } from "@/lib/utils";
import { useAuthAction } from "@/lib/use-auth-action";
import { useSavedIds, useToggleLike, useToggleSave } from "@/lib/use-post-actions";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const requireAuth = useAuthAction();
  const like = useToggleLike();
  const save = useToggleSave();
  const { data: savedIds } = useSavedIds();

  const liked = !!post.likedByMe;
  const saved = !!savedIds?.has(post.id);
  const author = post.author;
  const long = (post.caption ?? "").length > 120;

  const share = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <article className="border-b border-border pb-5">
      {author && (
        <header className="flex items-center gap-3 py-3">
          <Link href={`/profile/${encodeURIComponent(author.username)}`}>
            <Avatar src={author.avatarUrl} name={author.name} size={44} />
          </Link>
          <div className="min-w-0">
            <Link href={`/profile/${encodeURIComponent(author.username)}`} className="block truncate text-sm font-semibold hover:underline">
              {author.name}
            </Link>
            <p className="text-xs text-muted">{timeAgo(post.createdAt)}</p>
          </div>
        </header>
      )}

      <Link href={`/posts/${post.id}`} className="relative block aspect-square overflow-hidden rounded-xl bg-surface">
        <Image src={post.imageUrl} alt={post.caption || "Post image"} fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover" />
      </Link>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            onClick={() => requireAuth(() => like.mutate({ id: post.id, like: !liked }))}
          >
            <Heart size={24} className={cn(liked && "fill-danger text-danger")} />
          </button>
          <button type="button" className="text-sm" onClick={() => setLikesOpen(true)} aria-label="See who liked">
            {post.likeCount ?? 0}
          </button>
        </div>
        <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 text-sm" aria-label="Comments">
          <MessageCircle size={24} /> {post.commentCount ?? 0}
        </Link>
        <button type="button" aria-label="Copy link" onClick={share}>
          <Send size={22} />
        </button>
        <button
          type="button"
          className="ml-auto"
          aria-label={saved ? "Unsave" : "Save"}
          aria-pressed={saved}
          onClick={() => requireAuth(() => save.mutate({ id: post.id, save: !saved }))}
        >
          <Bookmark size={24} className={cn(saved && "fill-white")} />
        </button>
      </div>

      {post.caption && (
        <p className="mt-2 text-sm">
          {author && <span className="font-semibold">{author.username} </span>}
          <span className={cn(!expanded && "line-clamp-2")}>{post.caption}</span>
          {long && !expanded && (
            <button type="button" className="ml-1 font-semibold text-primary-300" onClick={() => setExpanded(true)}>
              Show More
            </button>
          )}
        </p>
      )}

      <LikesDialog postId={post.id} open={likesOpen} onOpenChange={setLikesOpen} />
    </article>
  );
}

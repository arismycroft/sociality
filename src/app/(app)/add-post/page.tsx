"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/ui/image-picker";
import { createPost } from "@/lib/api";

function AddPostForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("image", file!);
      if (caption.trim()) fd.append("caption", caption.trim());
      return createPost(fd);
    },
    onSuccess: () => {
      toast.success("Post shared");
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["my-posts"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/me");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" aria-label="Back" onClick={() => router.back()}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Add Post</h1>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!file) return setFileError("Please choose an image");
          m.mutate();
        }}
      >
        <div>
          <p className="mb-1.5 text-sm font-semibold">Photo</p>
          <ImagePicker file={file} onChange={setFile} error={fileError} onError={setFileError} />
        </div>
        <div>
          <label htmlFor="caption" className="mb-1.5 block text-sm font-semibold">Caption</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
            rows={4}
            placeholder="Create your caption"
            className="w-full rounded-xl border border-border bg-surface p-4 text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <Button type="submit" className="w-full" disabled={!file || m.isPending}>
          {m.isPending ? "Sharing…" : "Share"}
        </Button>
      </form>
    </div>
  );
}

export default function AddPostPage() {
  return (
    <RequireAuth>
      <AddPostForm />
    </RequireAuth>
  );
}

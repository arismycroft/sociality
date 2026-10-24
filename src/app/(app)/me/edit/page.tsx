"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RequireAuth } from "@/components/auth/require-auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { validateImage, ACCEPTED } from "@/components/ui/image-picker";
import { ErrorState, LoadingState } from "@/components/states";
import { getMe, updateMe } from "@/lib/api";
import { useAppDispatch } from "@/store";
import { updateUser } from "@/store/auth-slice";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9._]+$/, "Use only letters, numbers, dots and underscores"),
  phone: z.string().trim().regex(/^\+?\d{8,20}$/, "Enter a valid phone number"),
  bio: z.string().max(300, "Bio is max 300 characters").optional(),
});
type Values = z.infer<typeof schema>;

function EditForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (me.data) {
      const p = me.data.profile;
      reset({ name: p.name, username: p.username, phone: p.phone ?? "", bio: p.bio ?? "" });
    }
  }, [me.data, reset]);

  useEffect(() => {
    if (!avatar) return setAvatarPreview(null);
    const url = URL.createObjectURL(avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  const m = useMutation({
    mutationFn: (v: Values) => {
      const fd = new FormData();
      fd.append("name", v.name);
      fd.append("username", v.username);
      fd.append("phone", v.phone);
      fd.append("bio", v.bio ?? "");
      if (avatar) fd.append("avatar", avatar);
      return updateMe(fd);
    },
    onSuccess: async () => {
      const fresh = await qc.fetchQuery({ queryKey: ["me"], queryFn: getMe, staleTime: 0 });
      dispatch(updateUser({ name: fresh.profile.name, username: fresh.profile.username, phone: fresh.profile.phone, avatarUrl: fresh.profile.avatarUrl }));
      toast.success("Profile updated");
      router.replace("/me");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (me.isLoading) return <LoadingState />;
  if (me.isError || !me.data) return <ErrorState message={me.error?.message} onRetry={() => me.refetch()} />;
  const p = me.data.profile;

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" aria-label="Back" onClick={() => router.back()}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit((v) => m.mutate(v))} className="space-y-4" noValidate>
        <div className="flex flex-col items-center gap-2">
          <Avatar src={avatarPreview ?? p.avatarUrl} name={p.name} size={96} />
          <label className="cursor-pointer text-sm font-semibold text-primary-300 hover:underline">
            Change Photo
            <input
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const msg = validateImage(f);
                if (msg) toast.error(msg);
                else setAvatar(f);
              }}
            />
          </label>
        </div>

        <Field label="Name" error={errors.name?.message} {...register("name")} />
        <Field label="Username" error={errors.username?.message} {...register("username")} />
        <Field label="Email" value={p.email} readOnly disabled className="opacity-60" />
        <Field label="Number Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-semibold">Bio</label>
          <textarea id="bio" rows={3} {...register("bio")} className="w-full rounded-xl border border-border bg-surface p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          {errors.bio && <p className="text-xs text-danger">{errors.bio.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={m.isPending}>
          {m.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <RequireAuth>
      <EditForm />
    </RequireAuth>
  );
}

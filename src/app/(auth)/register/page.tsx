"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { login, register as registerUser } from "@/lib/api";
import { registerSchema, type RegisterValues } from "@/lib/validators";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSession } from "@/store/auth-slice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, hydrated } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (hydrated && token) router.replace("/feed");
  }, [hydrated, token, router]);

  // Register tidak mengembalikan token → langsung login otomatis (sesuai guide).
  const mutation = useMutation({
    mutationFn: async (v: RegisterValues) => {
      await registerUser({
        name: v.name,
        username: v.username,
        email: v.email,
        phone: v.phone,
        password: v.password,
      });
      return login({ email: v.email, password: v.password });
    },
    onSuccess: (data) => {
      dispatch(setSession(data));
      toast.success("Welcome to Sociality!");
      router.replace("/feed");
    },
  });

  return (
    <AuthCard title="Register">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
        <Field label="Name" placeholder="Enter your name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        {/* Desain tidak punya field Email, tetapi API mewajibkannya. */}
        <Field label="Email" type="email" placeholder="Enter your email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Field label="Username" placeholder="Enter your username" autoComplete="username" error={errors.username?.message} {...register("username")} />
        <Field label="Number Phone" type="tel" placeholder="Enter your number phone" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
        <Field label="Password" type="password" placeholder="Enter your password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Field label="Confirm Password" type="password" placeholder="Enter your confirm password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

        {mutation.isError && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {mutation.error.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account…" : "Submit"}
        </Button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary-300 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

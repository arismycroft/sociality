"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { login } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validators";
import { safeReturn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSession } from "@/store/auth-slice";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturn(params.get("returnTo"));
  const dispatch = useAppDispatch();
  const { token, hydrated } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Sudah login → langsung ke tujuan.
  useEffect(() => {
    if (hydrated && token) router.replace(returnTo);
  }, [hydrated, token, returnTo, router]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(setSession(data));
      router.replace(returnTo);
    },
  });

  return (
    <AuthCard title="Welcome Back!">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
        <Field label="Email" type="email" placeholder="Enter your email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Field label="Password" type="password" placeholder="Enter your password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />

        {mutation.isError && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {mutation.error.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging in…" : "Login"}
        </Button>

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary-300 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

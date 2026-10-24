import { Logo } from "@/components/logo";

/** Latar gradasi ungu + kartu tengah, dipakai Login dan Register. */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="auth-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] rounded-3xl border border-border bg-black/80 p-6 backdrop-blur sm:p-8">
        <div className="flex justify-center">
          <Logo href="/login" />
        </div>
        <h1 className="mt-4 text-center text-xl font-bold">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

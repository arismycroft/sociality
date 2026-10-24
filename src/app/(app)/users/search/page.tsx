"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { UserChip } from "@/components/user/user-chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { searchUsers } from "@/lib/api";
import { useDebounce } from "@/lib/use-debounce";

function SearchContent() {
  const [value, setValue] = useState(useSearchParams().get("q") ?? "");
  const q = useDebounce(value.trim(), 300);
  const res = useQuery({ queryKey: ["user-search", q], queryFn: () => searchUsers(q), enabled: q.length > 0 });
  const users = res.data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-4">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search users"
          aria-label="Search users"
          className="h-11 w-full rounded-pill border border-border bg-surface pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>
      <div className="mt-3">
        {q.length === 0 ? (
          <EmptyState title="Find people" description="Search by name or username." />
        ) : res.isLoading ? (
          <LoadingState />
        ) : res.isError ? (
          <ErrorState message={res.error.message} onRetry={() => res.refetch()} />
        ) : users.length === 0 ? (
          <EmptyState title="No results found" description="Change your keyword" />
        ) : (
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                <UserChip user={u} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function UserSearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

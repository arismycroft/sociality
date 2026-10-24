"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store, useAppDispatch } from "@/store";
import { hydrate } from "@/store/auth-slice";

function Hydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <Hydrator>{children}</Hydrator>
        <Toaster theme="dark" position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
}

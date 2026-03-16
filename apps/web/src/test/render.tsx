import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { ReactNode } from "react";
import { AntdProvider } from "@/components/providers/AntdProvider";

function Providers({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <AntdProvider>{children}</AntdProvider>
    </QueryClientProvider>
  );
}

export const renderWithProviders = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: Providers, ...options });

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ReactNode } from "react";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata = {
  title: "Bookmark Manager",
  description: "Save, organize, and search your bookmarks",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AntdProvider>{children}</AntdProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

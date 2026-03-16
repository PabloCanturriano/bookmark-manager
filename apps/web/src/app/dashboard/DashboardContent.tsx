"use client";

import { Layout } from "antd";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { BookmarkList } from "@/components/dashboard/BookmarkList";
import { BookmarkSection } from "@/components/dashboard/BookmarkSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useBookmarks } from "@/lib/bookmarks.queries";

const { Content } = Layout;

const TABS = ["home", "all", "bin"] as const;
type Tab = (typeof TABS)[number];

export function DashboardContent() {
  const [activeTab, setActiveTab] = useQueryState<Tab>(
    "tab",
    parseAsStringLiteral(TABS).withDefault("home"),
  );
  const [search, setSearch] = useState("");

  const { data: recent, isLoading: loadingRecent } = useBookmarks({ limit: 8 });
  const { data: favourites, isLoading: loadingFavourites } = useBookmarks({
    favorited: true,
    limit: 8,
  });

  const stats = [
    { label: "Bookmarks", value: recent?.total },
    { label: "Favourites", value: favourites?.total },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <DashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={setSearch}
      />

      <Content style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "24px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {activeTab === "home" && (
          <>
            <StatsCards stats={stats} isLoading={loadingRecent} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <BookmarkSection
                title="Recently Added"
                bookmarks={recent?.items}
                isLoading={loadingRecent}
                onViewAll={() => setActiveTab("all")}
              />
              <BookmarkSection
                title="Your Favourites"
                bookmarks={favourites?.items}
                isLoading={loadingFavourites}
              />
            </div>
          </>
        )}

        {activeTab === "all" && (
          <BookmarkList searchQuery={search} />
        )}

        {activeTab === "bin" && (
          <div className="flex items-center justify-center py-24 text-gray-400">
            Bin — coming soon
          </div>
        )}
      </Content>
    </Layout>
  );
}

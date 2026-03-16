"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { BookmarkList } from "@/components/dashboard/BookmarkList";
import { BookmarkSection } from "@/components/dashboard/BookmarkSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useBookmarks } from "@/lib/bookmarks.queries";

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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={setSearch}
      />

      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
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
      </main>
    </div>
  );
}

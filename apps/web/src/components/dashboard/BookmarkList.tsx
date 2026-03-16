"use client";

import { Pagination, Skeleton, Typography } from "antd";
import { useState } from "react";
import { useBookmarks } from "@/lib/bookmarks.queries";
import { BookmarkCard } from "./BookmarkCard";

const { Text } = Typography;

interface Props {
  favoritedOnly?: boolean;
  searchQuery?: string;
}

export function BookmarkList({ favoritedOnly, searchQuery }: Props) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const { data, isLoading } = useBookmarks({
    page,
    limit: PAGE_SIZE,
    ...(favoritedOnly && { favorited: true }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} active className="bg-white rounded-2xl p-4" />
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Text type="secondary">No bookmarks yet.</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.items.map((b) => (
          <BookmarkCard key={b.id} bookmark={b} />
        ))}
      </div>

      {data.total > PAGE_SIZE && (
        <div className="flex justify-center">
          <Pagination
            current={page}
            total={data.total}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

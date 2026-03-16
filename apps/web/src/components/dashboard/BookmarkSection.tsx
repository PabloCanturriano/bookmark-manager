'use client';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Skeleton, Typography } from 'antd';
import type { Bookmark } from '@/lib/bookmarks.queries';
import { BookmarkRow } from './BookmarkRow';

const { Title, Text } = Typography;

interface Props {
   title: string;
   bookmarks: Bookmark[] | undefined;
   isLoading: boolean;
   onViewAll?: () => void;
}

export function BookmarkSection({ title, bookmarks, isLoading, onViewAll }: Props) {
   return (
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
         <div className="flex items-center justify-between mb-3">
            <Title level={5} className="!m-0 text-gray-700">
               {title}
            </Title>
         </div>

         {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
               <Skeleton key={i} avatar active paragraph={{ rows: 1 }} className="py-1" />
            ))
         ) : bookmarks?.length === 0 ? (
            <Text type="secondary" className="py-4 text-center block text-sm">
               Nothing here yet.
            </Text>
         ) : (
            bookmarks?.map((b) => <BookmarkRow key={b.id} bookmark={b} />)
         )}

         {onViewAll && (
            <Button
               type="link"
               size="small"
               icon={<ArrowRightOutlined />}
               iconPlacement="end"
               onClick={onViewAll}
               className="mt-2 self-center text-xs"
            >
               View All
            </Button>
         )}
      </div>
   );
}

'use client';

import { DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { Avatar, Button, Popconfirm, Skeleton, Tooltip, Typography } from 'antd';
import {
   useBinBookmarks,
   useEmptyBin,
   usePermanentDeleteBookmark,
   useRestoreBookmark,
} from '@/lib/bookmarks.queries';
import { getDomain } from '@/lib/utils';

const { Text } = Typography;

export function BinList() {
   const { data, isLoading } = useBinBookmarks();
   const { mutate: restore } = useRestoreBookmark();
   const { mutate: permanentDelete } = usePermanentDeleteBookmark();
   const { mutate: emptyBin, isPending: emptying } = useEmptyBin();

   if (isLoading) {
      return (
         <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} active paragraph={{ rows: 1 }} />
            ))}
         </div>
      );
   }

   if (!data?.items.length) {
      return (
         <div className="flex flex-col items-center justify-center py-24">
            <Text type="secondary">Bin is empty.</Text>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <Text type="secondary" className="text-sm">
               {data.total} item{data.total !== 1 ? 's' : ''} in bin
            </Text>
            <Popconfirm
               title="Empty bin?"
               description="All items will be permanently deleted."
               onConfirm={() => emptyBin()}
               okText="Empty bin"
               okButtonProps={{ danger: true }}
               cancelText="Cancel"
            >
               <Button danger size="small" loading={emptying}>
                  Empty bin
               </Button>
            </Popconfirm>
         </div>

         <div className="flex flex-col gap-2">
            {data.items.map((bookmark) => {
               const domain = getDomain(bookmark.url);

               return (
                  <div
                     key={bookmark.id}
                     className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm opacity-70"
                  >
                     <Avatar
                        src={bookmark.favicon}
                        size={20}
                        shape="square"
                        style={{ borderRadius: 4, flexShrink: 0 }}
                     >
                        {domain[0]?.toUpperCase()}
                     </Avatar>

                     <div className="min-w-0 flex-1">
                        <Text className="block text-sm font-medium text-gray-700 truncate">
                           {bookmark.title ?? domain}
                        </Text>
                        <Text className="text-xs text-gray-400">{domain}</Text>
                     </div>

                     <div className="flex gap-1 flex-shrink-0">
                        <Tooltip title="Restore">
                           <Button
                              type="text"
                              size="small"
                              icon={<UndoOutlined className="text-gray-400" />}
                              onClick={() => restore(bookmark.id)}
                           />
                        </Tooltip>
                        <Popconfirm
                           title="Delete permanently?"
                           onConfirm={() => permanentDelete(bookmark.id)}
                           okText="Delete"
                           okButtonProps={{ danger: true }}
                           cancelText="Cancel"
                        >
                           <Tooltip title="Delete permanently">
                              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                           </Tooltip>
                        </Popconfirm>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}

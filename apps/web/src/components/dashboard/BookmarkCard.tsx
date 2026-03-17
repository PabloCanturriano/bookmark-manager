'use client';

import {
   DeleteOutlined,
   EditOutlined,
   ExportOutlined,
   HeartFilled,
   HeartOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Popconfirm, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import type { Bookmark } from '@/lib/bookmarks.queries';
import { useDeleteBookmark, useToggleFavorite } from '@/lib/bookmarks.queries';
import { EditBookmarkModal } from './EditBookmarkModal';

const { Text } = Typography;

interface Props {
   bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: Props) {
   const { mutate: toggleFavorite, isPending: togglingFav } = useToggleFavorite();
   const { mutate: deleteBookmark, isPending: deleting } = useDeleteBookmark();
   const [editOpen, setEditOpen] = useState(false);

   const domain = (() => {
      try {
         return new URL(bookmark.url).hostname.replace('www.', '');
      } catch {
         return bookmark.url;
      }
   })();

   return (
      <>
         <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            {bookmark.ogImage && (
               <div className="h-36 overflow-hidden bg-gray-100">
                  <img
                     src={bookmark.ogImage}
                     alt={bookmark.title ?? domain}
                     className="w-full h-full object-cover"
                     onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
               </div>
            )}

            <div className="p-4 flex flex-col gap-2 flex-1">
               <div className="flex items-start gap-2">
                  <Avatar
                     src={bookmark.favicon}
                     size={24}
                     shape="square"
                     style={{ borderRadius: 4, flexShrink: 0, marginTop: 2 }}
                  >
                     {domain[0]?.toUpperCase()}
                  </Avatar>
                  <div className="min-w-0">
                     <Text className="block font-semibold text-sm text-gray-800 leading-snug line-clamp-2">
                        {bookmark.title ?? domain}
                     </Text>
                     <Text className="text-xs text-gray-400">{domain}</Text>
                  </div>
               </div>

               {bookmark.description && (
                  <Text className="text-xs text-gray-500 line-clamp-2">{bookmark.description}</Text>
               )}
            </div>

            <div className="px-4 pb-3 flex items-center justify-between border-t border-gray-50 pt-2">
               <div className="flex gap-1">
                  <Tooltip
                     title={bookmark.isFavorited ? 'Remove from favourites' : 'Add to favourites'}
                  >
                     <Button
                        type="text"
                        size="small"
                        loading={togglingFav}
                        icon={
                           bookmark.isFavorited ? (
                              <HeartFilled className="text-red-500" />
                           ) : (
                              <HeartOutlined className="text-gray-400" />
                           )
                        }
                        onClick={() =>
                           toggleFavorite({ id: bookmark.id, isFavorited: bookmark.isFavorited })
                        }
                     />
                  </Tooltip>

                  <Tooltip title="Edit">
                     <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined className="text-gray-400" />}
                        onClick={() => setEditOpen(true)}
                     />
                  </Tooltip>

                  <Popconfirm
                     title="Delete this bookmark?"
                     onConfirm={() => deleteBookmark(bookmark.id)}
                     okText="Delete"
                     okButtonProps={{ danger: true }}
                     cancelText="Cancel"
                  >
                     <Tooltip title="Delete">
                        <Button
                           type="text"
                           size="small"
                           danger
                           loading={deleting}
                           icon={<DeleteOutlined />}
                        />
                     </Tooltip>
                  </Popconfirm>
               </div>

               <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                  <Button
                     type="text"
                     size="small"
                     icon={<ExportOutlined className="text-gray-400" />}
                  />
               </a>
            </div>
         </div>

         <EditBookmarkModal
            bookmark={bookmark}
            open={editOpen}
            onClose={() => setEditOpen(false)}
         />
      </>
   );
}

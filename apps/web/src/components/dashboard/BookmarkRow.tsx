'use client';

import { ExportOutlined } from '@ant-design/icons';
import { Avatar, Typography } from 'antd';
import type { Bookmark } from '@/lib/bookmarks.queries';

const { Text } = Typography;

interface Props {
   bookmark: Bookmark;
}

export function BookmarkRow({ bookmark }: Props) {
   const domain = (() => {
      try {
         return new URL(bookmark.url).hostname.replace('www.', '');
      } catch {
         return bookmark.url;
      }
   })();

   return (
      <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-gray-50 group transition-colors">
         <Avatar
            src={bookmark.favicon}
            size={36}
            shape="square"
            style={{ borderRadius: 8, flexShrink: 0 }}
         >
            {domain[0]?.toUpperCase()}
         </Avatar>

         <div className="flex-1 min-w-0">
            <Text className="block truncate text-sm font-medium text-gray-800">
               {bookmark.title ?? domain}
            </Text>
            <Text className="block truncate text-xs text-gray-400">{domain}</Text>
         </div>

         <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
         >
            <ExportOutlined />
         </a>
      </div>
   );
}

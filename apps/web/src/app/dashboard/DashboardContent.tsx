'use client';

import { Layout } from 'antd';
import { useState } from 'react';
import { BinList } from '@/components/dashboard/BinList';
import { BookmarkList } from '@/components/dashboard/BookmarkList';
import { CollectionsSider, type DashboardView } from '@/components/dashboard/CollectionsSider';
import { CreateBookmarkModal } from '@/components/dashboard/CreateBookmarkModal';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

const { Content } = Layout;

export function DashboardContent() {
   const [view, setView] = useState<DashboardView>(null);
   const [search, setSearch] = useState('');
   const [addOpen, setAddOpen] = useState(false);

   const handleSearch = (q: string) => {
      setSearch(q);
      // When searching, show all bookmarks context
      if (q.trim().length > 0 && view === '__bin__') setView(null);
   };

   return (
      <Layout style={{ minHeight: '100vh', background: '#f9fafb' }}>
         <DashboardHeader onSearch={handleSearch} onAdd={() => setAddOpen(true)} />
         <CreateBookmarkModal open={addOpen} onClose={() => setAddOpen(false)} />

         <Layout style={{ background: 'transparent' }}>
            <CollectionsSider view={view} onViewChange={setView} />

            <Content style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
               {view === '__bin__' ? (
                  <BinList />
               ) : (
                  <BookmarkList
                     searchQuery={search}
                     favoritedOnly={view === '__favourites__'}
                     collectionId={
                        typeof view === 'string' && !view.startsWith('__') ? view : undefined
                     }
                  />
               )}
            </Content>
         </Layout>
      </Layout>
   );
}

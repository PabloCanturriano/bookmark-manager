'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BookmarkSection } from '@/components/dashboard/BookmarkSection';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { useBookmarks } from '@/lib/bookmarks.queries';

export default function DashboardPage() {
   const [activeTab, setActiveTab] = useState<'home' | 'all' | 'bin'>('home');
   const [search, setSearch] = useState('');

   const { data: recent, isLoading: loadingRecent } = useBookmarks({ limit: 8 });
   const { data: favourites, isLoading: loadingFavourites } = useBookmarks({
      favorited: true,
      limit: 8,
   });
   const { data: all, isLoading: loadingAll } = useBookmarks({ limit: 8, page: 2 });

   const stats = [
      { label: 'Bookmarks', value: recent?.total },
      { label: 'Favourites', value: favourites?.total },
   ];

   return (
      <div className="min-h-screen bg-gray-50">
         <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} onSearch={setSearch} />

         <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
            <StatsCards stats={stats} isLoading={loadingRecent} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <BookmarkSection
                  title="Recently Added"
                  bookmarks={recent?.items}
                  isLoading={loadingRecent}
               />
               <BookmarkSection
                  title="Your Favourites"
                  bookmarks={favourites?.items}
                  isLoading={loadingFavourites}
               />
               <BookmarkSection
                  title="All Bookmarks"
                  bookmarks={all?.items}
                  isLoading={loadingAll}
               />
            </div>
         </main>
      </div>
   );
}

'use client';

import {
   BookOutlined,
   DeleteOutlined,
   HomeOutlined,
   LogoutOutlined,
   SearchOutlined,
   UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Input, InputRef } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

interface Props {
   activeTab: 'home' | 'all' | 'bin';
   onTabChange: (tab: 'home' | 'all' | 'bin') => void;
   onSearch: (q: string) => void;
}

const TABS = [
   { key: 'home', label: 'Home', icon: <HomeOutlined /> },
   { key: 'all', label: 'All Bookmarks', icon: <BookOutlined /> },
   { key: 'bin', label: 'Bin', icon: <DeleteOutlined /> },
] as const;

export function DashboardHeader({ activeTab, onTabChange, onSearch }: Props) {
   const router = useRouter();
   const { user, clearUser } = useAuthStore();
   const searchRef = useRef<InputRef>(null);

   useEffect(() => {
      const handler = (e: KeyboardEvent) => {
         if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchRef.current?.focus?.();
         }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
   }, []);

   const handleLogout = async () => {
      await api.post('/auth/logout');
      clearUser();
      router.push('/login');
   };

   return (
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
         <div className="flex items-center gap-6">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
               B
            </div>
            <nav className="flex items-center gap-1">
               {TABS.map(({ key, label, icon }) => (
                  <button
                     key={key}
                     onClick={() => onTabChange(key)}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === key
                           ? 'text-indigo-600 border-b-2 border-indigo-500'
                           : 'text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     {icon}
                     {label}
                  </button>
               ))}
            </nav>
         </div>

         <div className="flex items-center gap-3">
            <Input
               ref={searchRef}
               prefix={<SearchOutlined className="text-gray-400" />}
               placeholder="Search / Ctrl + K"
               suffix={<span className="text-xs text-gray-300">⌘K</span>}
               onChange={(e) => onSearch(e.target.value)}
               className="w-64 rounded-full bg-gray-50"
               variant="filled"
            />
            <Dropdown
               menu={{
                  items: [
                     {
                        key: 'email',
                        label: <span className="text-gray-500 text-xs">{user?.email}</span>,
                        disabled: true,
                     },
                     { type: 'divider' },
                     {
                        key: 'logout',
                        label: 'Logout',
                        icon: <LogoutOutlined />,
                        danger: true,
                        onClick: handleLogout,
                     },
                  ],
               }}
               placement="bottomRight"
            >
               <Avatar icon={<UserOutlined />} className="cursor-pointer bg-indigo-500" />
            </Dropdown>
         </div>
      </header>
   );
}

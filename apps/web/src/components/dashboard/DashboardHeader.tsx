'use client';

import {
   BookOutlined,
   DeleteOutlined,
   HomeOutlined,
   LogoutOutlined,
   SearchOutlined,
   UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, InputRef, Layout, Menu } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

const { Header } = Layout;

interface Props {
   activeTab: 'home' | 'all' | 'bin';
   onTabChange: (tab: 'home' | 'all' | 'bin') => void;
   onSearch: (q: string) => void;
   onAdd: () => void;
}

const NAV_ITEMS = [
   { key: 'home', label: 'Home', icon: <HomeOutlined /> },
   { key: 'all', label: 'All Bookmarks', icon: <BookOutlined /> },
   { key: 'bin', label: 'Bin', icon: <DeleteOutlined /> },
];

export function DashboardHeader({ activeTab, onTabChange, onSearch, onAdd }: Props) {
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
      <Header
         style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            position: 'sticky',
            top: 0,
            zIndex: 100,
         }}
      >
         <div
            style={{
               width: 32,
               height: 32,
               background: '#6366f1',
               borderRadius: 8,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: '#fff',
               fontWeight: 700,
               fontSize: 14,
               flexShrink: 0,
            }}
         >
            B
         </div>

         <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            items={NAV_ITEMS}
            onClick={({ key }) => onTabChange(key as Props['activeTab'])}
            style={{ flex: 1, border: 'none', minWidth: 0 }}
         />

         <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Button
               type="primary"
               icon={<PlusOutlined />}
               onClick={onAdd}
               style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
               Add
            </Button>
            <Input
               ref={searchRef}
               prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
               placeholder="Search / Ctrl + K"
               suffix={<span style={{ fontSize: 11, color: '#d1d5db' }}>⌘K</span>}
               onChange={(e) => onSearch(e.target.value)}
               style={{ width: 256, borderRadius: 999 }}
               variant="filled"
            />
            <Dropdown
               menu={{
                  items: [
                     {
                        key: 'email',
                        label: (
                           <span style={{ color: '#6b7280', fontSize: 12 }}>{user?.email}</span>
                        ),
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
               <Avatar
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer', background: '#6366f1' }}
               />
            </Dropdown>
         </div>
      </Header>
   );
}

'use client';

import { LogoutOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, InputRef, Layout } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

const { Header } = Layout;

interface Props {
   onSearch: (_q: string) => void;
   onAdd: () => void;
}

export function DashboardHeader({ onSearch, onAdd }: Props) {
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
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 100,
         }}
      >
         <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <div
               style={{
                  width: 28,
                  height: 28,
                  background: '#6366f1',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
               }}
            >
               B
            </div>
            <span style={{ fontWeight: 600, fontSize: 18, color: '#1f2937' }}>ookmark Manager</span>
         </div>

         <div style={{ flex: 1 }} />

         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Input
               ref={searchRef}
               prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
               placeholder="Search / Ctrl + K"
               suffix={<span style={{ fontSize: 11, color: '#d1d5db' }}>⌘K</span>}
               onChange={(e) => onSearch(e.target.value)}
               style={{ width: 256, borderRadius: 999 }}
               variant="filled"
            />
            <Button
               type="primary"
               icon={<PlusOutlined />}
               onClick={onAdd}
               style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
               Add
            </Button>
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

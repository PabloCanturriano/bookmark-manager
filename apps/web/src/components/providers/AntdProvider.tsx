'use client';

import { ConfigProvider } from 'antd';
import { ReactNode } from 'react';

export function AntdProvider({ children }: { children: ReactNode }) {
   return (
      <ConfigProvider
         theme={{
            token: {
               colorPrimary: '#6366f1',
               borderRadius: 8,
            },
         }}
      >
         {children}
      </ConfigProvider>
   );
}

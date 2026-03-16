'use client';

import { Skeleton, Typography } from 'antd';

const { Title, Text } = Typography;

interface Stat {
   value: number | undefined;
   label: string;
}

interface Props {
   stats: Stat[];
   isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: Props) {
   return (
      <div className="flex gap-4">
         {stats.map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl px-6 py-4 shadow-sm min-w-[140px]">
               {isLoading ? (
                  <Skeleton active paragraph={false} title={{ width: 60 }} />
               ) : (
                  <>
                     <Title level={3} className="!m-0 !text-gray-800">
                        {value ?? '—'}
                     </Title>
                     <Text type="secondary" className="text-sm">
                        {label}
                     </Text>
                  </>
               )}
            </div>
         ))}
      </div>
   );
}

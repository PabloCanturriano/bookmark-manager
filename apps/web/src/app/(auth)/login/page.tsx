'use client';

import { Alert, Button, Form, Input, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ErrorCode, LoginSchema } from '@bookmark-manager/types';
import { useLoginMutation } from '@/lib/auth.queries';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

export default function LoginPage() {
   const t = useTranslations('auth.login');
   const tVal = useTranslations('validation');
   const tErr = useTranslations('errors');
   const router = useRouter();
   const { setUser } = useAuthStore();
   const { mutate: login, isPending, error } = useLoginMutation();

   const onFinish = (values: { email: string; password: string }) => {
      login(values, {
         onSuccess: ({ user }) => {
            setUser(user);
            router.push('/dashboard');
         },
      });
   };

   const errorCode = error instanceof Error ? error.message : null;
   const errorMessage = errorCode
      ? tErr.has(errorCode)
         ? tErr(errorCode as never)
         : tErr(ErrorCode.INTERNAL_ERROR)
      : null;

   return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
         <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
               <Title level={3} className="!mb-1">
                  {t('title')}
               </Title>
               <Text type="secondary">{t('subtitle')}</Text>
            </div>

            {errorMessage && (
               <div className="pb-4">
                  <Alert type="error" title={errorMessage} showIcon />
               </div>
            )}

            <Form layout="vertical" onFinish={onFinish} disabled={isPending}>
               <Form.Item
                  name="email"
                  label={t('emailLabel')}
                  rules={[
                     {
                        validator: async (_, value) => {
                           const result = LoginSchema.shape.email.safeParse(value);
                           if (!result.success) throw new Error(tVal('invalidEmail'));
                        },
                     },
                  ]}
               >
                  <Input type="email" autoComplete="email" />
               </Form.Item>

               <Form.Item
                  name="password"
                  label={t('passwordLabel')}
                  rules={[
                     {
                        validator: async (_, value) => {
                           const result = LoginSchema.shape.password.safeParse(value);
                           if (!result.success) throw new Error(tVal('required'));
                        },
                     },
                  ]}
               >
                  <Input.Password autoComplete="current-password" />
               </Form.Item>

               <Button type="primary" htmlType="submit" block loading={isPending} className="mt-2">
                  {t('submitButton')}
               </Button>
            </Form>

            <div className="mt-4 text-center">
               <Text type="secondary">{t('noAccount')} </Text>
               <Link href="/register">{t('registerLink')}</Link>
            </div>
         </div>
      </div>
   );
}

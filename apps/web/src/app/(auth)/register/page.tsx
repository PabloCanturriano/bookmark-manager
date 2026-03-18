'use client';

import { Alert, Button, Form, Input, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ErrorCode, RegisterSchema } from '@bookmark-manager/types';
import { useRegisterMutation } from '@/lib/auth.queries';
import { useAuthStore } from '@/store/auth.store';

const { Title } = Typography;

export default function RegisterPage() {
   const t = useTranslations('auth.register');
   const tVal = useTranslations('validation');
   const tErr = useTranslations('errors');
   const router = useRouter();
   const { setUser } = useAuthStore();
   const { mutate: register, isPending, error } = useRegisterMutation();

   const onFinish = (values: { name: string; email: string; password: string }) => {
      register(values, {
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
            </div>

            {errorMessage && (
               <Alert type="error" title={errorMessage} className="mb-4 pb-[10px]" showIcon />
            )}

            <Form layout="vertical" onFinish={onFinish} disabled={isPending}>
               <Form.Item
                  name="name"
                  label={t('nameLabel')}
                  rules={[
                     {
                        validator: async (_, value) => {
                           const result = RegisterSchema.shape.name.safeParse(value);
                           if (!result.success) throw new Error(tVal('required'));
                        },
                     },
                  ]}
               >
                  <Input autoComplete="name" />
               </Form.Item>

               <Form.Item
                  name="email"
                  label={t('emailLabel')}
                  rules={[
                     {
                        validator: async (_, value) => {
                           const result = RegisterSchema.shape.email.safeParse(value);
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
                           const result = RegisterSchema.shape.password.safeParse(value);
                           if (!result.success) throw new Error(tVal('passwordMinLength'));
                        },
                     },
                  ]}
               >
                  <Input.Password autoComplete="new-password" />
               </Form.Item>

               <Button type="primary" htmlType="submit" block loading={isPending} className="mt-2">
                  {t('submitButton')}
               </Button>
            </Form>

            <div className="mt-4 text-center">
               <Link href="/login">{t('loginLink')}</Link>
            </div>
         </div>
      </div>
   );
}

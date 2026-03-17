'use client';

import { CreateBookmarkSchema } from '@bookmark-manager/types';
import { Form, Input, Select, Switch } from 'antd';
import Modal from 'antd/es/modal/Modal';
import { useCreateBookmark } from '@/lib/bookmarks.queries';
import { useCollections } from '@/lib/collections.queries';

interface Props {
   open: boolean;
   onClose: () => void;
}

interface FormValues {
   url: string;
   title?: string;
   collectionId?: string;
   isFavorited?: boolean;
}

export function CreateBookmarkModal({ open, onClose }: Props) {
   const [form] = Form.useForm<FormValues>();
   const { mutate: createBookmark, isPending } = useCreateBookmark();
   const { data: collections } = useCollections();

   const handleSubmit = (values: FormValues) => {
      createBookmark(values, {
         onSuccess: () => {
            form.resetFields();
            onClose();
         },
      });
   };

   const handleCancel = () => {
      form.resetFields();
      onClose();
   };

   return (
      <Modal
         title="Add Bookmark"
         open={open}
         onOk={() => form.submit()}
         onCancel={handleCancel}
         okText="Add"
         confirmLoading={isPending}
         destroyOnHidden
      >
         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isFavorited: false }}
            style={{ marginTop: 16 }}
         >
            <Form.Item
               name="url"
               label="URL"
               rules={[
                  {
                     validator: async (_, value) => {
                        const result = CreateBookmarkSchema.shape.url.safeParse(value);
                        if (!result.success) throw new Error(result.error.errors[0].message);
                     },
                  },
               ]}
            >
               <Input placeholder="https://example.com" autoFocus />
            </Form.Item>

            <Form.Item
               name="title"
               label="Title"
               rules={[
                  {
                     validator: async (_, value) => {
                        if (!value) return;
                        const result = CreateBookmarkSchema.shape.title.safeParse(value);
                        if (!result.success) throw new Error(result.error.errors[0].message);
                     },
                  },
               ]}
            >
               <Input placeholder="Leave empty to auto-detect from page" />
            </Form.Item>

            <Form.Item name="collectionId" label="Collection">
               <Select
                  allowClear
                  placeholder="No collection"
                  options={collections?.map((c) => ({ value: c.id, label: c.name }))}
               />
            </Form.Item>

            <Form.Item name="isFavorited" label="Add to favourites" valuePropName="checked">
               <Switch />
            </Form.Item>
         </Form>
      </Modal>
   );
}

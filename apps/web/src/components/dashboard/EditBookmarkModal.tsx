'use client';

import { UpdateBookmarkSchema } from '@bookmark-manager/types';
import { Form, Input, Modal } from 'antd';
import type { Bookmark } from '@/lib/bookmarks.queries';
import { useUpdateBookmark } from '@/lib/bookmarks.queries';

interface Props {
   bookmark: Bookmark;
   open: boolean;
   onClose: () => void;
}

interface FormValues {
   title: string;
   description?: string;
}

export function EditBookmarkModal({ bookmark, open, onClose }: Props) {
   const [form] = Form.useForm<FormValues>();
   const { mutate: updateBookmark, isPending } = useUpdateBookmark();

   const handleSubmit = (values: FormValues) => {
      updateBookmark(
         { id: bookmark.id, dto: values },
         {
            onSuccess: () => {
               form.resetFields();
               onClose();
            },
         },
      );
   };

   const handleCancel = () => {
      form.resetFields();
      onClose();
   };

   return (
      <Modal
         title="Edit Bookmark"
         open={open}
         onOk={() => form.submit()}
         onCancel={handleCancel}
         okText="Save"
         confirmLoading={isPending}
         destroyOnHidden
      >
         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
               title: bookmark.title ?? '',
               description: bookmark.description ?? '',
            }}
            style={{ marginTop: 16 }}
         >
            <Form.Item
               name="title"
               label="Title"
               rules={[
                  {
                     validator: async (_, value) => {
                        if (!value) return;
                        const result = UpdateBookmarkSchema.shape.title.safeParse(value);
                        if (!result.success) throw new Error(result.error.errors[0].message);
                     },
                  },
               ]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               name="description"
               label="Description"
               rules={[
                  {
                     validator: async (_, value) => {
                        if (!value) return;
                        const result = UpdateBookmarkSchema.shape.description.safeParse(value);
                        if (!result.success) throw new Error(result.error.errors[0].message);
                     },
                  },
               ]}
            >
               <Input.TextArea rows={3} />
            </Form.Item>
         </Form>
      </Modal>
   );
}

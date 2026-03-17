'use client';

import {
   DeleteOutlined,
   FolderOutlined,
   HeartOutlined,
   PlusOutlined,
   UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Layout, Menu, Modal, Popconfirm, Skeleton } from 'antd';
import { CreateCollectionSchema } from '@bookmark-manager/types';
import { useState } from 'react';
import {
   useCollections,
   useCreateCollection,
   useDeleteCollection,
} from '@/lib/collections.queries';

const { Sider } = Layout;

export type DashboardView = null | '__favourites__' | '__bin__' | string;

interface Props {
   view: DashboardView;
   onViewChange: (view: DashboardView) => void;
}

interface FormValues {
   name: string;
   isPublic: boolean;
}

export function CollectionsSider({ view, onViewChange }: Props) {
   const { data: collections, isLoading } = useCollections();
   const { mutate: createCollection, isPending: creating } = useCreateCollection();
   const { mutate: deleteCollection } = useDeleteCollection();
   const [modalOpen, setModalOpen] = useState(false);
   const [form] = Form.useForm<FormValues>();

   const handleCreate = (values: FormValues) => {
      createCollection(values, {
         onSuccess: () => {
            form.resetFields();
            setModalOpen(false);
         },
      });
   };

   const selectedKey = view ?? '__all__';

   const menuItems = [
      {
         key: '__all__',
         icon: <UnorderedListOutlined />,
         label: 'Bookmarks',
      },
      {
         key: '__favourites__',
         icon: <HeartOutlined />,
         label: 'Favourites',
      },
      ...(isLoading
         ? []
         : (collections ?? []).map((c) => ({
              key: c.id,
              icon: <FolderOutlined />,
              label: (
                 <div className="flex items-center justify-between group">
                    <span className="truncate">{c.name}</span>
                    <Popconfirm
                       title="Delete collection?"
                       description="Bookmarks will not be deleted."
                       onConfirm={(e) => {
                          e?.stopPropagation();
                          deleteCollection(c.id);
                          if (view === c.id) onViewChange(null);
                       }}
                       okText="Delete"
                       okButtonProps={{ danger: true }}
                       cancelText="Cancel"
                    >
                       <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                       />
                    </Popconfirm>
                 </div>
              ),
           }))),
      {
         key: '__bin__',
         icon: <DeleteOutlined />,
         label: 'Bin',
         danger: true,
      },
   ];

   return (
      <>
         <Sider
            width={220}
            style={{
               background: '#fff',
               borderRight: '1px solid #f0f0f0',
               display: 'flex',
               flexDirection: 'column',
               paddingTop: 16,
            }}
         >
            {isLoading ? (
               <div style={{ padding: '0 16px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                     <Skeleton.Input
                        key={i}
                        active
                        size="small"
                        block
                        style={{ marginBottom: 8 }}
                     />
                  ))}
               </div>
            ) : (
               <Menu
                  mode="inline"
                  selectedKeys={[selectedKey]}
                  items={menuItems}
                  onClick={({ key }) =>
                     onViewChange(key === '__all__' ? null : (key as DashboardView))
                  }
                  style={{ border: 'none', flex: 1 }}
               />
            )}

            <div
               style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', marginTop: 'auto' }}
            >
               <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  size="small"
                  block
                  onClick={() => setModalOpen(true)}
               >
                  New collection
               </Button>
            </div>
         </Sider>

         <Modal
            title="New Collection"
            open={modalOpen}
            onOk={() => form.submit()}
            onCancel={() => {
               form.resetFields();
               setModalOpen(false);
            }}
            okText="Create"
            confirmLoading={creating}
            destroyOnHidden
         >
            <Form
               form={form}
               layout="vertical"
               onFinish={handleCreate}
               initialValues={{ isPublic: false }}
               style={{ marginTop: 16 }}
            >
               <Form.Item name="isPublic" hidden>
                  <Input />
               </Form.Item>
               <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                     {
                        validator: async (_, value) => {
                           const result = CreateCollectionSchema.shape.name.safeParse(value);
                           if (!result.success) throw new Error(result.error.errors[0].message);
                        },
                     },
                  ]}
               >
                  <Input placeholder="e.g. Design resources" autoFocus />
               </Form.Item>
            </Form>
         </Modal>
      </>
   );
}

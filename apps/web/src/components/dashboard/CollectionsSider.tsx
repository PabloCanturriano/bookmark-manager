'use client';

import { DeleteOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, Menu, Modal, Popconfirm, Skeleton, Typography } from 'antd';
import { CreateCollectionSchema } from '@bookmark-manager/types';
import { useState } from 'react';
import { useCreateCollection, useDeleteCollection, useCollections } from '@/lib/collections.queries';

const { Sider } = Layout;
const { Text } = Typography;

interface Props {
   selectedId: string | null;
   onSelect: (id: string | null) => void;
}

interface FormValues {
   name: string;
   isPublic: boolean;
}

export function CollectionsSider({ selectedId, onSelect }: Props) {
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

   const menuItems = [
      {
         key: '__all__',
         icon: <FolderOutlined />,
         label: 'All bookmarks',
      },
      ...(collections ?? []).map((c) => ({
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
                     if (selectedId === c.id) onSelect(null);
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
      })),
   ];

   return (
      <>
         <Sider
            width={220}
            style={{
               background: '#fff',
               borderRight: '1px solid #f0f0f0',
               padding: '16px 0',
               display: 'flex',
               flexDirection: 'column',
            }}
         >
            <div style={{ padding: '0 16px 12px' }}>
               <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Collections
               </Text>
            </div>

            {isLoading ? (
               <div style={{ padding: '0 16px' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Skeleton.Input key={i} active size="small" block style={{ marginBottom: 8 }} />
                  ))}
               </div>
            ) : (
               <Menu
                  mode="inline"
                  selectedKeys={[selectedId ?? '__all__']}
                  items={menuItems}
                  onClick={({ key }) => onSelect(key === '__all__' ? null : key)}
                  style={{ border: 'none', flex: 1 }}
               />
            )}

            <div style={{ padding: '12px 16px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
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
            onCancel={() => { form.resetFields(); setModalOpen(false); }}
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
               <Form.Item name="isPublic" hidden />
               <Form.Item
                  name="name"
                  label="Name"
                  rules={[{
                     validator: async (_, value) => {
                        const result = CreateCollectionSchema.shape.name.safeParse(value);
                        if (!result.success) throw new Error(result.error.errors[0].message);
                     },
                  }]}
               >
                  <Input placeholder="e.g. Design resources" autoFocus />
               </Form.Item>
            </Form>
         </Modal>
      </>
   );
}

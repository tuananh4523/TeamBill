"use client";

import { useEffect } from 'react';
import { Modal, Form, Input, Select, Typography } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { TeamPrivacy } from '@/types';

interface TeamModalProps {
  openAdd: boolean;
  openEdit: boolean;
  openDelete: boolean;
  openTeam: any;
  deleteConfirmName: string;
  teamForm: FormInstance;
  onAddCancel: () => void;
  onEditCancel: () => void;
  onDeleteCancel: () => void;
  onAddOk: () => void;
  onEditOk: () => void;
  onDeleteOk: () => void;
  onDeleteConfirmChange: (value: string) => void;
}

const { Title, Text } = Typography;

const privacyOptions = [
  { value: 'private', label: 'Riêng tư' },
  { value: 'public', label: 'Công khai' },
  { value: 'invite-only', label: 'Chỉ mời' },
];

export default function TeamModal({
  openAdd,
  openEdit,
  openDelete,
  openTeam,
  deleteConfirmName,
  teamForm,
  onAddCancel,
  onEditCancel,
  onDeleteCancel,
  onAddOk,
  onEditOk,
  onDeleteOk,
  onDeleteConfirmChange,
}: TeamModalProps) {
  useEffect(() => {
    if (openEdit && openTeam) {
      teamForm.setFieldsValue({
        name: openTeam.name,
        privacy: openTeam.privacy,
      });
    }
  }, [openEdit, openTeam]);

  return (
    <>
      {/* Add Team Modal */}
      <Modal
        title="Thêm nhóm mới"
        open={openAdd}
        onOk={onAddOk}
        onCancel={onAddCancel}
        destroyOnClose
      >
        <Form form={teamForm} layout="vertical">
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên nhóm" />
          </Form.Item>
          <Form.Item name="privacy" label="Quyền riêng tư" initialValue="private">
            <Select options={privacyOptions} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        title={`Sửa nhóm "${openTeam?.name || ''}"`}
        open={openEdit}
        onOk={onEditOk}
        onCancel={onEditCancel}
        destroyOnClose
      >
        <Form form={teamForm} layout="vertical">
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="privacy" label="Quyền riêng tư">
            <Select options={privacyOptions} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Team Confirm Modal */}
      <Modal
        title="Xác nhận xóa nhóm"
        open={openDelete}
        onOk={onDeleteOk}
        onCancel={onDeleteCancel}
        okButtonProps={{
          disabled: deleteConfirmName !== openTeam?.name,
        }}
        okText="Xóa"
      >
        <p>
          Xóa nhóm <strong>{openTeam?.name}</strong> sẽ xóa tất cả dữ liệu liên quan.
        </p>
        <p>Nhập <strong>{openTeam?.name}</strong> để xác nhận:</p>
        <Input
          value={deleteConfirmName}
          onChange={(e) => onDeleteConfirmChange(e.target.value)}
          placeholder={`Nhập "${openTeam?.name}"`}
        />
      </Modal>
    </>
  );
}

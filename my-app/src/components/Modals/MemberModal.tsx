"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { IMember, MemberStatus } from "@/lib/api";

type MemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<IMember>) => Promise<void>; 
  form: FormInstance;
  editingMember?: IMember | null;
  teamId: string;
  userId: string;
};

export default function MemberModal({
  open,
  onCancel,
  onSubmit,
  form,
  editingMember,
  teamId,
  userId,
}: MemberModalProps) {

  // Khi mở modal để edit → fill form
  useEffect(() => {
    if (editingMember) {
      form.setFieldsValue({
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role,
        status: editingMember.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        role: "member",
      });
    }
  }, [editingMember, form]);


  // Ấn lưu → gửi payload chính xác cho API
  const handleOk = async () => {
    const values = await form.validateFields();

    if (editingMember) {
      // === UPDATE === (PUT /members/:memberId)
      await onSubmit({
        ...values,
        teamId,
        userId: editingMember.userId,
      });
    } else {
      // === CREATE === (POST /members)
      await onSubmit({
        userId,
        teamId,
        name: values.name,
        email: values.email,
        role: values.role,
      });
    }
  };

  return (
    <Modal
      title={editingMember ? "Sửa thành viên" : "Thêm thành viên"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form form={form} layout="vertical">

        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input placeholder="Tên thành viên" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>

        <Form.Item name="role" label="Vai trò">
          <Select>
            <Select.Option value="member">Thành viên</Select.Option>
            <Select.Option value="admin">Quản trị</Select.Option>
            <Select.Option value="owner">Người tạo</Select.Option>
          </Select>
        </Form.Item>

        {editingMember && (
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value={MemberStatus.Active}>Hoạt động</Select.Option>
              <Select.Option value={MemberStatus.Inactive}>Ngưng hoạt động</Select.Option>
              <Select.Option value={MemberStatus.Left}>Đã rời nhóm</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

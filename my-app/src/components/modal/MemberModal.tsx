"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Avatar, Button, Switch, Upload, message, Space } from "antd";
import type { FormInstance, UploadProps } from "antd";
import { UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/apiClient";
import type { Member, MemberStatus, User } from "@/types";

type MemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<Member>) => Promise<void>;
  form: FormInstance;
  editingMember?: Member | null;
  teamId: string;
  userId: string;
  users: User[];
};

export default function MemberModal({
  open,
  onCancel,
  onSubmit,
  form,
  editingMember,
  teamId,
  userId,
  users,
}: MemberModalProps) {
  const [isNewUserMode, setIsNewUserMode] = useState(false);
  const [newUserAvatar, setNewUserAvatar] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fill form for edit
  useEffect(() => {
    if (editingMember) {
      form.setFieldsValue({
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role,
        status: editingMember.status,
      });
      setIsNewUserMode(false);
    } else {
      form.resetFields();
      form.setFieldsValue({ role: "member" });
      setIsNewUserMode(false);
      setNewUserAvatar("");
    }
  }, [editingMember, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editingMember) {
        // Update existing
        await onSubmit({
          ...values,
          teamId,
          userId: editingMember.userId,
        });
      } else if (isNewUserMode) {
        // Create new user first, then member
        const newUserData = {
          fullName: values.name,
          email: values.email || "",
          avatar: newUserAvatar,
          // Minimal for non-app user, no password/username
        };

        const newUser = await apiClient<User>("/users/signup", {
          method: "POST",
          body: newUserData,
        });

        await onSubmit({
          userId: newUser.id,
          teamId,
          name: values.name,
          email: values.email || "",
          role: values.role,
        });
      } else {
        // Select existing user
        const selectedUserId = form.getFieldValue("userId");
        await onSubmit({
          userId: selectedUserId,
          teamId,
          role: values.role,
        });
      }
    } catch (error) {
      message.error("Lỗi khi lưu thành viên");
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.fullName} (${user.email})`,
  })).map((opt) => ({
    label: (
      <Space>
        <Avatar 
          src={users.find((u) => u.id === opt.value)?.avatar || `https://i.pravatar.cc/40?u=${(users.find((u) => u.id === opt.value)?.email || "")}`} 
          icon={<UserOutlined />} 
        />
        <span>{opt.label}</span>
      </Space>
    ) as any,
    value: opt.value,
  }));

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => setNewUserAvatar(e.target?.result as string);
      reader.readAsDataURL(file);
      return false; // Prevent upload
    },
    maxCount: 1,
  };

  return (
    <Modal
      title={editingMember ? "Sửa thành viên" : "Thêm thành viên"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {editingMember ? (
          <>
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="role" label="Vai trò">
              <Select>
                <Select.Option value="member">Thành viên</Select.Option>
                <Select.Option value="admin">Quản trị</Select.Option>
                <Select.Option value="owner">Người tạo</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="inactive">Ngưng hoạt động</Select.Option>
                <Select.Option value="left">Đã rời nhóm</Select.Option>
              </Select>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label="Thêm bạn bè hoặc tạo mới">
              <Space>
                <Switch 
                  checkedChildren="Tạo mới" 
                  unCheckedChildren="Chọn bạn bè" 
                  onChange={(checked) => setIsNewUserMode(checked)}
                />
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  size="small"
                  onClick={() => setIsNewUserMode(true)}
                >
                  Tạo người mới
                </Button>
              </Space>
            </Form.Item>

            {isNewUserMode ? (
              <>
                <Form.Item
                  name="name"
                  label="Tên"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input placeholder="Tên thành viên" />
                </Form.Item>
                <Form.Item name="email" label="Email (tùy chọn)">
                  <Input placeholder="email@example.com" />
                </Form.Item>
                <Form.Item label="Avatar">
                  <Upload {...uploadProps}>
                    <Button icon={<UserOutlined />}>Chọn ảnh</Button>
                  </Upload>
                  {newUserAvatar && (
                    <Avatar src={newUserAvatar} style={{ marginTop: 8 }} size={64} />
                  )}
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name="userId"
                label="Chọn bạn bè"
                rules={[{ required: true, message: "Vui lòng chọn bạn bè" }]}
              >
                <Select 
                  placeholder="Tìm bạn bè đã kết bạn..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={userOptions}
                />
              </Form.Item>
            )}

            <Form.Item name="role" label="Vai trò">
              <Select>
                <Select.Option value="member">Thành viên</Select.Option>
                <Select.Option value="admin">Quản trị</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}


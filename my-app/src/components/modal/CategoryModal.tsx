"use client";

import {
  Modal,
  Form,
  Input,
  ColorPicker,
  Row,
  Col,
} from "antd";
import type { FormInstance } from "antd"; 

type CategoryFormValues = {
  name: string;
  color: string;
  description?: string;
};

type UICategory = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

type CategoryModalProps = {
  open: boolean;
  form: FormInstance<CategoryFormValues>;
  editingCategory: UICategory | null;
  onCancel: () => void;
  onSave: () => Promise<void>;
};

export default function CategoryModal({
  open,
  form,
  editingCategory,
  onCancel,
  onSave,
}: CategoryModalProps) {
  return (
    <Modal
      title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={18}>
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên danh mục" },
              ]}
            >
              <Input placeholder="Ví dụ: Ăn uống" size="large" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Màu sắc"
              name="color"
              rules={[{ required: true, message: "Chọn màu cho danh mục" }]}
            >
              <ColorPicker
                format="hex"
                onChange={(color) =>
                  form.setFieldsValue({ color: color.toHexString() })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea placeholder="Nhập mô tả chi tiết" rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}


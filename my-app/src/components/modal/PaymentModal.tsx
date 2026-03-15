"use client";

import { Modal, Form, Input, DatePicker, InputNumber, Select } from "antd";
import type { FormInstance } from "antd";
import type { Dayjs } from "dayjs";

import type { PaymentStatus } from "@/app/payments/page";

type PaymentFormValues = {
  name: string;
  date: Dayjs;
  amount: number;
  status: PaymentStatus;
};

type PaymentModalProps = {
  open: boolean;
  form: FormInstance<PaymentFormValues>;
  isEditing: boolean;
  onCancel: () => void;
  onSave: () => Promise<void>;
};

export default function PaymentModal({
  open,
  form,
  isEditing,
  onCancel,
  onSave,
}: PaymentModalProps) {
  return (
    <Modal
      title={isEditing ? "Sửa thanh toán" : "Thêm thanh toán mới"}
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Người thanh toán"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên người thanh toán" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Ngày"
          name="date"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        >
          <DatePicker format="DD/MM/YYYY" className="w-full" />
        </Form.Item>
        <Form.Item
          label="Số tiền (₫)"
          name="amount"
          rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            <Select.Option value="HOÀN TẤT">Hoàn tất</Select.Option>
            <Select.Option value="THẤT BẠI">Thất bại</Select.Option>
            <Select.Option value="ĐANG XỬ LÝ">Đang xử lý</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


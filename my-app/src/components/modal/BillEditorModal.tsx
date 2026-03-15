"use client";

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  InputNumber,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { useCreateExpense, useUpdateExpense } from "@/hooks/api";
import { Expense, CreateExpensePayload, UpdateExpensePayload } from "@/types";

export type BillEditorModalProps = {
  open: boolean;
  onClose: () => void;
  teamId: string;
  editingExpense?: Expense | null;
  userId: string;
};

type FormValues = {
  title: string;
  date: Dayjs;
  amount: number;
  category?: string;
  description?: string;
};

const categories = [
  { value: "Ăn uống", label: "Ăn uống" },
  { value: "Shopping", label: "Shopping" },
  { value: "Cafe", label: "Cafe" },
  { value: "Đi lại", label: "Đi lại" },
  { value: "Giải trí", label: "Giải trí" },
  { value: "Khác", label: "Khác" },
];

export default function BillEditorModal({
  open,
  onClose,
  teamId,
  editingExpense,
  userId,
}: BillEditorModalProps) {
  const [form] = Form.useForm<FormValues>();

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  useEffect(() => {
    if (editingExpense) {
      form.setFieldsValue({
        title: editingExpense.title,
        date: dayjs(editingExpense.date),
        amount: editingExpense.amount,
        category: editingExpense.category,
        description: editingExpense.description,
      });
    } else {
      form.resetFields();
    }
  }, [editingExpense, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingExpense) {
        const payload: UpdateExpensePayload = {
          id: editingExpense._id,
          data: {
            title: values.title,
            amount: values.amount,
            category: values.category,
            description: values.description,
            date: values.date.toISOString(),
          },
        };

        await updateExpense.mutateAsync(payload);
        message.success("Cập nhật chi tiêu thành công");
      } else {
        const payload: CreateExpensePayload = {
          teamId,
          createdBy: userId,
          title: values.title,
          amount: values.amount,
          category: values.category,
          description: values.description,
          date: values.date.toISOString(),
        };

        await createExpense.mutateAsync(payload);
        message.success("Thêm chi tiêu thành công");
      }

      form.resetFields();
      onClose();
    } catch {
      message.error("Vui lòng nhập đầy đủ thông tin");
    }
  };

  const loading = createExpense.isPending || updateExpense.isPending;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingExpense ? "Cập nhật chi tiêu" : "Thêm chi tiêu"}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Huỷ
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editingExpense ? "Cập nhật" : "Lưu"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
          <Input placeholder="Nhập tiêu đề chi tiêu" />
        </Form.Item>

        <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Số tiền (VNĐ)"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" min={0} placeholder="Nhập số tiền" />
        </Form.Item>

        <Form.Item name="category" label="Danh mục">
          <Select options={categories} placeholder="Chọn danh mục" />
        </Form.Item>

        <Form.Item name="description" label="Ghi chú">
          <Input.TextArea placeholder="Thêm ghi chú (nếu có)" rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

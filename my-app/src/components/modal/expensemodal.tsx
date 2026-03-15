"use client";

import { Modal, Form, Input, InputNumber, Select, DatePicker } from "antd";
import type { FormInstance } from "antd";
import type { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

type ExpenseFormValues = {
  teamId: string;
  title: string;
  amount: number;
  date: Dayjs;
};

type TeamOption = {
  id: string;
  name: string;
};

type ExpenseQuickModalProps = {
  open: boolean;
  form: FormInstance<ExpenseFormValues>;
  teams: TeamOption[];
  onClose: () => void;
};

export default function ExpenseQuickModal({
  open,
  form,
  teams,
  onClose,
}: ExpenseQuickModalProps) {
  const router = useRouter();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const teamId = values.teamId;
      onClose();
      if (teamId) {
        router.push(`/split/${teamId}`);
      }
    } catch {
    }
  };

  return (
    <Modal
      title="Thêm ghi chép nhanh"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Đi tới chia hoá đơn"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nhóm"
          name="teamId"
          rules={[{ required: true, message: "Vui lòng chọn nhóm" }]}
        >
          <Select placeholder="Chọn nhóm">
            {teams.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Tiêu đề" name="title">
          <Input placeholder="Ví dụ: Cơm trưa, tiền cafe..." />
        </Form.Item>
        <Form.Item label="Số tiền (VNĐ)" name="amount">
          <InputNumber
            min={0}
            className="w-full"
            placeholder="Nhập số tiền (tuỳ chọn)"
          />
        </Form.Item>
        <Form.Item label="Ngày" name="date">
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}


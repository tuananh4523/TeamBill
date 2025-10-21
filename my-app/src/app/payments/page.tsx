"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Tag,
  Form,
  Statistic,
  Card,
  Modal,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// ================= Types =================
export type PaymentStatus = "HOÀN TẤT" | "THẤT BẠI" | "ĐANG XỬ LÝ";

export type Payment = {
  _id: string;
  name: string;
  date: string;
  amount: number;
  status: PaymentStatus;
};

// ================= Main =================
export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form] = Form.useForm();

  // Fake load data
  useEffect(() => {
    const fakePayments: Payment[] = [
      { _id: "1", name: "Nguyễn Văn A", date: "2025-05-02", amount: 342900, status: "HOÀN TẤT" },
      { _id: "2", name: "Trần Thị B", date: "2025-04-23", amount: 150000, status: "THẤT BẠI" },
      { _id: "3", name: "Lê Văn C", date: "2025-06-05", amount: 450000, status: "ĐANG XỬ LÝ" },
    ];
    setPayments(fakePayments);
  }, []);

  // Stats
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const successCount = payments.filter((p) => p.status === "HOÀN TẤT").length;
  const failedCount = payments.filter((p) => p.status === "THẤT BẠI").length;

  // CRUD
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formatted: Payment = {
        _id: editingPayment ? editingPayment._id : Date.now().toString(),
        ...values,
        date: dayjs(values.date).format("YYYY-MM-DD"),
      };

      if (editingPayment) {
        setPayments((prev) =>
          prev.map((p) => (p._id === editingPayment._id ? formatted : p))
        );
        message.success("Cập nhật thanh toán thành công!");
      } else {
        setPayments((prev) => [...prev, formatted]);
        message.success("Thêm thanh toán thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingPayment(null);
    } catch {
      message.error("Lỗi khi lưu thanh toán");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa thanh toán này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setPayments((prev) => prev.filter((p) => p._id !== id));
        message.success("Xóa thanh toán thành công!");
      },
    });
  };

  // Table columns
  const columns = [
    { title: "Người thanh toán", dataIndex: "name" },
    {
      title: "Ngày",
      dataIndex: "date",
      render: (val: string) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      align: "right" as const,
      render: (val: number) => `${val.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: PaymentStatus) => {
        switch (status) {
          case "HOÀN TẤT":
            return <Tag color="green">Hoàn tất</Tag>;
          case "THẤT BẠI":
            return <Tag color="red">Thất bại</Tag>;
          case "ĐANG XỬ LÝ":
            return <Tag color="orange">Đang xử lý</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Payment) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPayment(record);
              form.setFieldsValue({
                ...record,
                date: dayjs(record.date),
              });
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800 p-2">
      <h1 className="text-2xl font-bold mb-1">Quản lý phương thức thanh toán</h1>
      <p className="text-gray-500 mb-6">
        Theo dõi, thêm, chỉnh sửa và quản lý các phương thức thanh toán của nhóm
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm border-t-4 border-blue-400">
          <Statistic
            title="Tổng thanh toán"
            value={totalAmount}
            suffix="₫"
            valueStyle={{ color: "#1677ff", fontWeight: "bold" }}
          />
        </Card>
        <Card className="shadow-sm border-t-4 border-green-500">
          <Statistic
            title="Thanh toán thành công"
            value={successCount}
            valueStyle={{ color: "#389e0d", fontWeight: "bold" }}
          />
        </Card>
        <Card className="shadow-sm border-t-4 border-red-500">
          <Statistic
            title="Thanh toán thất bại"
            value={failedCount}
            valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
          />
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          shape="round"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
        >
          Thêm thanh toán
        </Button>
      </div>

      {/* Table */}
      <Table
        rowKey="_id"
        dataSource={payments}
        columns={columns}
        pagination={false}
        scroll={{ y: 400, x: "100%" }}
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={editingPayment ? "Sửa thanh toán" : "Thêm thanh toán mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
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
    </div>
  );
}

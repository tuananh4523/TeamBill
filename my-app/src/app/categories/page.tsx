"use client";

import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Card,
  ColorPicker,
  Row,
  Col,
  Space,
  Dropdown,
  Table,
  Tag,
  ConfigProvider,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

import { useState } from "react";
import type { TableProps } from "antd";
import viVN from "antd/es/locale/vi_VN";

import AuthModal from "@/components/Modals/AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hook/useCategory";
import type { UICategory, ICategory } from "@/lib/types";

export default function CategoriesPage() {
  const { user } = useAuth();              
  const userId = user?.id;

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UICategory | null>(null);
  const [form] = Form.useForm<UICategory>();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState<"recent" | "az" | "za">("recent");

  // ===== API HOOKS =====
  const { data: apiCategories = [] } = useCategories(userId);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // map api → ui
  const categories: UICategory[] = apiCategories.map((c: ICategory) => ({
    id: c.id!,
    name: c.name,
    color: c.color,
    description: c.description,
  }));

  // SORT
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortKey === "az") return a.name.localeCompare(b.name);
    if (sortKey === "za") return b.name.localeCompare(a.name);
    return Number(b.id) - Number(a.id);
  });

  const sortMenu = [
    { key: "recent", label: "Mới nhất" },
    { key: "az", label: "A → Z" },
    { key: "za", label: "Z → A" },
  ];

  // OPEN MODAL
  const openModal = (category?: UICategory) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
    category ? form.setFieldsValue(category) : form.resetFields();
  };

  // ================== SAVE ==================
  const handleSave = async () => {
    const values = await form.validateFields();

    if (!userId) {
      setIsAuthOpen(true);
      return;
    }

    if (editingCategory) {
      await updateCategory.mutateAsync({
        _id: editingCategory.id,
        userId,
        ...values,
      });
      message.success("Cập nhật danh mục thành công!");
    } else {
      await createCategory.mutateAsync({
        userId,
        ...values,
      });
      message.success("Thêm danh mục thành công!");
    }

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // ================== DELETE ==================
  const handleDelete = async (id: string) => {
    if (!userId) {
      setIsAuthOpen(true);
      return;
    }

    await deleteCategory.mutateAsync({ id, userId });
    message.success("Xoá danh mục thành công!");
  };

  // TABLE COLUMNS
  const columns: TableProps<UICategory>["columns"] = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Tag color={record.color} style={{ padding: "5px 12px", fontWeight: 500 }}>
          {record.name}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color) => (
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
          <span style={{ color }}>{color}</span>
        </div>
      ),
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <div
        className="min-h-screen px-6 py-6"
        style={{ backgroundColor: "#DFF2FD", fontFamily: "Inter" }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Danh mục chi tiêu</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                  viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <AppstoreOutlined />
              </button>

              <button
                className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                  viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"
                }`}
                onClick={() => setViewMode("list")}
              >
                <UnorderedListOutlined />
              </button>
            </div>

            <Dropdown menu={{ items: sortMenu, onClick: (info) => setSortKey(info.key as any) }}>
              <Button shape="round">
                {sortMenu.find((i) => i.key === sortKey)?.label} <DownOutlined />
              </Button>
            </Dropdown>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} shape="round">
              Thêm
            </Button>
          </div>
        </div>

        {/* NỘI DUNG */}
        {viewMode === "grid" ? (
          <Row gutter={[16, 16]}>
            {sortedCategories.map((cat) => (
              <Col key={cat.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  className="shadow-sm"
                  style={{
                    borderRadius: 12,
                    borderTop: `4px solid ${cat.color}`,
                    paddingTop: 16,
                    minHeight: 165,
                  }}
                >
                  <Tag
                    color={cat.color}
                    style={{
                      fontWeight: 500,
                      padding: "6px 12px",
                      fontSize: 15,
                      borderRadius: 6,
                    }}
                  >
                    {cat.name}
                  </Tag>

                  <p className="text-gray-600 mt-3 text-sm">
                    {cat.description || "Không có mô tả"}
                  </p>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button icon={<EditOutlined />} onClick={() => openModal(cat)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(cat.id)} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Table
            bordered
            dataSource={sortedCategories}
            columns={columns}
            rowKey="id"
            style={{ borderRadius: 10, overflow: "hidden", background: "white" }}
          />
        )}

        {/* MODAL */}
        <Modal
          title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={18}>
                <Form.Item
                  label="Tên danh mục"
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
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
                    onChange={(color) => form.setFieldsValue({ color: color.toHexString() })}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea placeholder="Nhập mô tả chi tiết" rows={4} />
            </Form.Item>
          </Form>
        </Modal>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={() => {}}
        />
      </div>
    </ConfigProvider>
  );
}

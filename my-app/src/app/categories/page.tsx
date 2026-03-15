"use client";

import { Button, Form, Input, message, Card, Row, Col, Space, Dropdown, Table, Tag, ConfigProvider } from "antd";

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

import AuthModal from "@/components/modal/AuthModal";
import CategoryModal from "@/components/modal/CategoryModal";
import { useAuth } from "@/context/AuthContext";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/api/useCategories/useCategories";
import type { Category } from "@/types";

type SortKey = "recent" | "az" | "za";

type UICategory = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);

  const r = Math.min(255, (num >> 16) + (255 - (num >> 16)) * percent);
  const g = Math.min(
    255,
    ((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * percent
  );
  const b = Math.min(255, (num & 0xff) + (255 - (num & 0xff)) * percent);

  return `rgb(${r}, ${g}, ${b})`;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UICategory | null>(
    null
  );
  const [form] = Form.useForm<UICategory>();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  // ===== API HOOKS =====
  const { data: apiCategories = [] } = useGetCategories(userId || "");
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // map api → ui
  const categories: UICategory[] = apiCategories.map((c: Category) => ({
    id: c._id,
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

    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
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
        id: editingCategory.id,
        data: {
          name: values.name,
          color: values.color,
          description: values.description,
        },
      });
      message.success("Cập nhật danh mục thành công!");
    } else {
      await createCategory.mutateAsync({
        userId,
        name: values.name,
        color: values.color,
        description: values.description,
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

    await deleteCategory.mutateAsync(id);
    message.success("Xoá danh mục thành công!");
  };

  // TABLE COLUMNS
  const columns: TableProps<UICategory>["columns"] = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Tag
          style={{
            backgroundColor: lightenColor(record.color, 0.85),
            border: `1px solid ${lightenColor(record.color, 0.50)}`,
            color: record.color, 
            padding: "6px 16px",
            fontSize: 14,
            borderRadius: 6,
            fontWeight: 500,
            display: "inline-block",
          }}
        >
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
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Danh mục chi tiêu
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-gray-600"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <AppstoreOutlined />
              </button>

              <button
                className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-gray-600"
                }`}
                onClick={() => setViewMode("list")}
              >
                <UnorderedListOutlined />
              </button>
            </div>

            <Dropdown
              menu={{
                items: sortMenu,
                onClick: (info) => setSortKey(info.key as SortKey),
              }}
            >
              <Button shape="round">
                {sortMenu.find((i) => i.key === sortKey)?.label}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              shape="round"
            >
              Thêm
            </Button>
          </div>
        </div>

        {/* Nội dung */}
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
                    style={{
                      backgroundColor: lightenColor(cat.color, 0.85),
                      border: `2px solid ${lightenColor(cat.color, 0.50)}`,
                      color: cat.color,
                      padding: "6px 16px",
                      fontSize: 15,
                      borderRadius: 6,
                      fontWeight: 500,
                      display: "inline-block",
                    }}
                  >
                    {cat.name}
                  </Tag>

                  <p className="text-gray-600 mt-3 text-sm">
                    {cat.description || "Không có mô tả"}
                  </p>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openModal(cat)}
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(cat.id)}
                    />
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
            style={{
              borderRadius: 10,
              overflow: "hidden",
              background: "white",
            }}
          />
        )}

        <CategoryModal
          open={isModalOpen}
          form={form}
          editingCategory={editingCategory}
          onCancel={() => setIsModalOpen(false)}
          onSave={handleSave}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={() => {}}
        />
      </div>
    </ConfigProvider>
  );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Modal,
  Button,
  Table,
  Space,
  Avatar,
  Tag,
  Form,
  Input,
  Dropdown,
  Spin,
  Row,
  Col,
  Card,
  Typography,
  MenuProps,
} from "antd";
import { useRouter } from "next/navigation";
import {
  SettingOutlined,
  PlusOutlined,
  CheckOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AuthModal from "@/components/Modals/AuthModal";
import MemberModal from "@/components/Modals/MemberModal";

const { Title, Text } = Typography;

// ================= Types =================
export enum MemberStatus {
  Active = "Hoạt động",
  Inactive = "Ngưng hoạt động",
}

export type Member = {
  _id: string;
  name: string;
  role: string;
  email: string;
  status: MemberStatus;
  teamId: string;
};

export type Group = {
  _id: string;
  name: string;
  members: Member[];
};

// ================= API URL =================
const API_URL = "http://localhost:8080/api";

// ================= Main Component =================
export default function TeamMembersPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<Group | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState("recent");

  // ================= Load Data =================
  const loadGroupsWithMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Group[]>(`${API_URL}/teams`);
      setGroups(res.data);
    } catch {
      toast.error("Không thể tải danh sách nhóm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupsWithMembers();
  }, []);

  const handleReload = () => loadGroupsWithMembers();

  // ================= CRUD Group =================
  const handleAddGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      await axios.post(`${API_URL}/teams`, values);
      toast.success("Tạo nhóm mới thành công!");
      setIsAddGroupOpen(false);
      groupForm.resetFields();
      loadGroupsWithMembers();
    } catch {
      toast.error("Lỗi khi tạo nhóm");
    }
  };

  const handleUpdateGroup = async () => {
    if (!openGroup) return;
    try {
      const values = await groupForm.validateFields();
      await axios.put(`${API_URL}/teams/${openGroup._id}`, values);
      setGroups((prev) =>
        prev.map((g) =>
          g._id === openGroup._id ? { ...g, name: values.name } : g
        )
      );
      setOpenGroup({ ...openGroup, name: values.name });
      toast.success("Cập nhật nhóm thành công!");
      setIsEditGroupOpen(false);
      groupForm.resetFields();
    } catch {
      toast.error("Lỗi khi cập nhật nhóm");
    }
  };

  const handleDeleteGroupConfirm = async () => {
    if (!openGroup) return;
    if (deleteConfirmName !== openGroup.name) {
      toast.error("Tên nhóm không khớp, không thể xoá!");
      return;
    }
    try {
      await axios.delete(`${API_URL}/teams/${openGroup._id}`);
      toast.success("Xoá nhóm thành công!");
      setGroups((prev) => prev.filter((g) => g._id !== openGroup._id));
      setOpenGroup(null);
      setIsDeleteGroupOpen(false);
      setDeleteConfirmName("");
    } catch {
      toast.error("Lỗi khi xoá nhóm");
    }
  };

  // ================= CRUD Member =================
  const handleSaveMember = async () => {
    if (!openGroup) return;
    try {
      const values = await form.validateFields();
      if (editingMember) {
        await axios.put(`${API_URL}/members/${editingMember._id}`, values);
        toast.success("Cập nhật thành viên thành công!");
      } else {
        await axios.post(`${API_URL}/teams/${openGroup._id}/members`, values);
        toast.success("Thêm thành viên mới thành công!");
      }
      setIsMemberModalOpen(false);
      form.resetFields();
      setEditingMember(null);
      loadGroupsWithMembers();
    } catch {
      toast.error("Lỗi khi lưu thành viên");
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    try {
      await axios.delete(`${API_URL}/members/${id}`);
      toast.success("Xóa thành viên thành công!");
      loadGroupsWithMembers();
    } catch {
      toast.error("Lỗi khi xóa thành viên");
    }
  };

  // ================= Columns Table =================
  const memberColumns = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (_: unknown, record: Member) => (
        <div className="flex items-center gap-3">
          <Avatar src={`https://i.pravatar.cc/40?u=${record._id}`} />
          <div>
            <div className="font-semibold text-base">{record.name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Vai trò", dataIndex: "role" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (val: MemberStatus) =>
        val === MemberStatus.Active ? (
          <Tag className="bg-green-100 text-green-700 border-none px-3 py-1 rounded-full text-sm font-medium">
            Hoạt động
          </Tag>
        ) : (
          <Tag className="bg-red-100 text-red-600 border-none px-3 py-1 rounded-full text-sm font-medium">
            Ngưng hoạt động
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Member) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setEditingMember(record);
              form.setFieldsValue(record);
              setIsMemberModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteMember(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const sortMenu: MenuProps["items"] = [
    { key: "recent", label: <span>Mới nhất</span> },
    { key: "az", label: <span>Theo tên (A → Z)</span> },
    { key: "members", label: <span>Theo số thành viên</span> },
  ];

  // ================= Render =================
  return (
    <Spin spinning={loading}>
      <div className="min-h-screen p-6 ">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Title level={3} className="!mb-0 text-gray-800">
            Quản lý nhóm
          </Title>

          <Space size="middle" align="center">
            <Button
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => setIsAddGroupOpen(true)}
            >
              Thêm nhóm
            </Button>

            <Dropdown
              menu={{
                items: sortMenu,
                onClick: (info) => setSortKey(info.key),
              }}
            >
              <Button shape="round">
                {
                  {
                    recent: "Mới nhất",
                    az: "Theo tên (A → Z)",
                    members: "Theo số thành viên",
                  }[sortKey]
                }{" "}
                <DownOutlined />
              </Button>
            </Dropdown>

            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            />
          </Space>
        </Row>

        {/* Danh sách nhóm */}
        <Row gutter={[16, 16]}>
          {groups.map((group) => {
            const hasActive = group.members.some(
              (m) => m.status === MemberStatus.Active
            );

            const cardColor = group.members.length
              ? hasActive
                ? "#e6f9ed"
                : "#ffeaea"
              : "#f3f4f6";

            return (
              <Col xs={24} sm={12} lg={8} key={group._id}>
                <Card
                  className="rounded-3xl shadow-sm hover:shadow-lg transition cursor-pointer"
                  style={{ backgroundColor: cardColor }}
                  onClick={() => router.push(`/split/${group._id}`)}
                >
                  {/* Header nhóm */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {group.name}
                    </h3>
                    <Tag
                      color={
                        group.members.length === 0
                          ? "default"
                          : hasActive
                          ? "green"
                          : "red"
                      }
                    >
                      {group.members.length === 0
                        ? "Chưa có thành viên"
                        : hasActive
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </Tag>
                  </div>

                  {/* Avatar thành viên */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2 mb-3">
                      {group.members.slice(0, 4).map((m) => (
                        <Avatar
                          key={m._id}
                          src={`https://i.pravatar.cc/32?u=${m._id}`}
                          className="border-2 border-white"
                        />
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 text-xs rounded-full border-2 border-white">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>

               
                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      className="text-gray-500 hover:text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenGroup(group);
                      }}
                    />
                  </div>

                  {/* Dòng cuối */}
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{group.members.length} thành viên</span>
                    <Text type="secondary">Xem chi tiết →</Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={() => setIsAuthOpen(false)}
        />

        {/* Modal chi tiết nhóm */}
        <Modal
          title={`Danh sách thành viên - ${openGroup?.name || ""}`}
          open={!!openGroup}
          onCancel={() => setOpenGroup(null)}
          footer={null}
          width={800}
        >
          <div className="mb-5 flex justify-between">
            <div className="flex gap-3">
              <Button
                type="primary"
                shape="round"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditingMember(null);
                  setIsMemberModalOpen(true);
                }}
              >
                Thêm thành viên
              </Button>

              <Button
                shape="round"
                icon={<EditOutlined />}
                onClick={() => {
                  groupForm.setFieldsValue({ name: openGroup?.name });
                  setIsEditGroupOpen(true);
                }}
              >
                Sửa tên nhóm
              </Button>
            </div>

            <Button
              danger
              shape="round"
              icon={<DeleteOutlined />}
              onClick={() => setIsDeleteGroupOpen(true)}
            >
              Xóa nhóm
            </Button>
          </div>

          <Table
            rowKey="_id"
            dataSource={openGroup?.members || []}
            columns={memberColumns}
            pagination={false}
          />
        </Modal>

        {/* Modal thành viên */}
        <MemberModal
          open={isMemberModalOpen}
          onCancel={() => setIsMemberModalOpen(false)}
          onSave={handleSaveMember}
          form={form}
          editingMember={editingMember}
        />

        {/* Modal tạo nhóm */}
        <Modal
          title="Tạo nhóm mới"
          open={isAddGroupOpen}
          onCancel={() => setIsAddGroupOpen(false)}
          onOk={handleAddGroup}
          okText="Tạo"
          cancelText="Hủy"
        >
          <Form form={groupForm} layout="vertical">
            <Form.Item
              label="Tên nhóm"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
            >
              <Input placeholder="Nhập tên nhóm" size="large" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal sửa nhóm */}
        <Modal
          title="Sửa tên nhóm"
          open={isEditGroupOpen}
          onCancel={() => setIsEditGroupOpen(false)}
          onOk={handleUpdateGroup}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={groupForm} layout="vertical">
            <Form.Item
              label="Tên nhóm"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
            >
              <Input placeholder="Nhập tên nhóm mới" size="large" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal xoá nhóm */}
        <Modal
          title="Xác nhận xoá nhóm"
          open={isDeleteGroupOpen}
          onCancel={() => {
            setIsDeleteGroupOpen(false);
            setDeleteConfirmName("");
          }}
          onOk={handleDeleteGroupConfirm}
          okText="Xóa"
          okButtonProps={{ danger: true }}
          cancelText="Hủy"
        >
          <p>
            Nhập tên nhóm <b>{openGroup?.name}</b> để xác nhận xoá:
          </p>
          <Input
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            placeholder="Nhập chính xác tên nhóm"
            size="large"
          />
        </Modal>
      </div>
    </Spin>
  );
}

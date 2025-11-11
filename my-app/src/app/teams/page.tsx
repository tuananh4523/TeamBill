"use client";

import { useState } from "react";
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
  message,
} from "antd";
import {
  SettingOutlined,
  PlusOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  useUserTeams,
  useUserTeamCreate,
  useUserTeamUpdate,
  useUserTeamDelete,
} from "@/lib/hook";
import { ITeam, IMember, MemberStatus } from "@/lib/api";
import MemberModal from "@/components/Modals/MemberModal";
import AuthModal from "@/components/Modals/AuthModal";

const { Title, Text } = Typography;

/* ======================== KIỂU PHỤ ======================== */
type ITeamWithMembers = ITeam & { members: IMember[] };

export default function TeamMembersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  /* ================= REACT QUERY HOOKS ================= */
  const { data: teams, isLoading, refetch: refetchTeams } = useUserTeams();
  const { mutate: createTeam } = useUserTeamCreate();
  const { mutate: updateTeam } = useUserTeamUpdate();
  const { mutate: deleteTeam } = useUserTeamDelete();

  /* ================= STATE ================= */
  const [openGroup, setOpenGroup] = useState<ITeamWithMembers | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [editingMember, setEditingMember] = useState<IMember | null>(null);

  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();

  const sortOptions = [
    { key: "recent", label: "Mới nhất" },
    { key: "az", label: "Theo tên (A → Z)" },
    { key: "members", label: "Theo số thành viên" },
  ];
  const [sortKey, setSortKey] = useState("recent");

  /* ================= CRUD NHÓM ================= */
  const handleAddGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      createTeam(values, {
        onSuccess: () => {
          message.success("Tạo nhóm thành công!");
          setIsAddGroupOpen(false);
          groupForm.resetFields();
          refetchTeams();
        },
      });
    } catch {
      message.error("Lỗi khi tạo nhóm!");
    }
  };

  const handleUpdateGroup = async () => {
    if (!openGroup) return;
    try {
      const values = await groupForm.validateFields();
      updateTeam(
        { id: openGroup._id ?? openGroup.id ?? "", data: values },
        {
          onSuccess: () => {
            message.success("Cập nhật nhóm thành công!");
            setIsEditGroupOpen(false);
            groupForm.resetFields();
            refetchTeams();
          },
        }
      );
    } catch {
      message.error("Lỗi khi cập nhật nhóm!");
    }
  };

  const handleDeleteGroup = async () => {
    if (!openGroup) return;
    if (deleteConfirmName !== openGroup.name) {
      message.warning("Tên nhóm không khớp, không thể xoá!");
      return;
    }
    deleteTeam(openGroup._id ?? openGroup.id ?? "", {
      onSuccess: () => {
        message.success("Đã xoá nhóm thành công!");
        setOpenGroup(null);
        setIsDeleteGroupOpen(false);
        setDeleteConfirmName("");
        refetchTeams();
      },
    });
  };

  /* ================= CRUD THÀNH VIÊN ================= */
  const handleSaveMember = async () => {
    message.info("Chức năng quản lý thành viên sẽ được thêm sau.");
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = async () => {
    message.info("Chức năng xóa thành viên sẽ được thêm sau.");
  };

  /* ================= CỘT BẢNG ================= */
  const memberColumns = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (_: unknown, record: IMember) => (
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
        val === "active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: IMember) => (
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
          <Button type="link" danger onClick={handleDeleteMember}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  /* ================= LOADING ================= */
  if (authLoading || isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin tip="Đang tải danh sách nhóm..." />
      </div>
    );

  /* ================= GIAO DIỆN ================= */
  return (
    <Spin spinning={isLoading}>
      <div className="min-h-screen p-6 bg-[#DFF2FD]">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Title level={3} className="!mb-0 text-gray-800 font-bold">
            Quản lý nhóm
          </Title>

          <Space size="middle" align="center">
            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<PlusOutlined />}
              className="shadow-sm"
              onClick={() => setIsAddGroupOpen(true)}
            >
              Thêm nhóm
            </Button>

            <Dropdown
              menu={{
                items: sortOptions,
                onClick: (info) => setSortKey(info.key),
              }}
            >
              <Button shape="round" size="large" className="shadow-sm">
                {{
                  recent: "Mới nhất",
                  az: "Theo tên (A → Z)",
                  members: "Theo số thành viên",
                }[sortKey]}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>

            <Button
              shape="circle"
              size="large"
              icon={<ReloadOutlined />}
              className="shadow-sm"
              onClick={() => refetchTeams()}
            />
          </Space>
        </Row>

        {/* Danh sách nhóm */}
        <Row gutter={[16, 16]}>
          {(teams as ITeamWithMembers[])?.map((group: ITeamWithMembers) => {
            const hasActive = group.members?.some(
              (m: IMember) => m.status === MemberStatus.Active
            );
            const cardColor = group.members?.length
              ? hasActive
                ? "#f0fff4"
                : "#fff5f5"
              : "#f7f9fa";

            return (
              <Col xs={24} sm={12} lg={8} key={group._id}>
                <Card
                  className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  style={{ backgroundColor: cardColor }}
                  onClick={() => router.push(`/split/${group._id}`)}
                >
                  {/* Header nhóm */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {group.name}
                    </h3>
                    <Tag
                      color={
                        group.members?.length === 0
                          ? "default"
                          : hasActive
                          ? "green"
                          : "red"
                      }
                      style={{ borderRadius: 8, padding: "2px 10px" }}
                    >
                      {group.members?.length === 0
                        ? "Chưa có thành viên"
                        : hasActive
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </Tag>
                  </div>

                  {/* Avatar thành viên */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex -space-x-2">
                      {group.members?.slice(0, 4).map((m: IMember) => (
                        <Avatar
                          key={m._id}
                          src={`https://i.pravatar.cc/32?u=${m._id}`}
                          className="border-2 border-white"
                        />
                      ))}
                      {group.members && group.members.length > 4 && (
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 text-xs rounded-full border-2 border-white">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>

                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      className="text-gray-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenGroup(group);
                      }}
                    />
                  </div>

                  {/* Dòng cuối */}
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{group.members?.length || 0} thành viên</span>
                    <Text
                      type="secondary"
                      className="text-blue-600 font-medium"
                    >
                      Xem chi tiết →
                    </Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Modal chi tiết nhóm */}
        <Modal
          title={
            <span className="font-semibold text-lg text-gray-800">
              Danh sách thành viên - {openGroup?.name || ""}
            </span>
          }
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
                className="shadow-sm"
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
                className="shadow-sm"
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
              className="shadow-sm"
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
            size="middle"
            bordered
            className="rounded-xl"
          />
        </Modal>

        {/* Modal thêm thành viên */}
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
          title={
            <span className="font-semibold text-lg text-red-600">
              Xác nhận xoá nhóm
            </span>
          }
          open={isDeleteGroupOpen}
          onCancel={() => {
            setIsDeleteGroupOpen(false);
            setDeleteConfirmName("");
          }}
          onOk={handleDeleteGroup}
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

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={() => refetchTeams()}
        />
      </div>
    </Spin>
  );
}

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
  useMemberCreate,
} from "@/lib/hook";
import API, { ITeam, IMember, MemberStatus } from "@/lib/api";
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

  const createMember = useMemberCreate(); // <<< BỔ SUNG QUAN TRỌNG

  /* ================= STATE ================= */
  const [openTeam, setOpenTeam] = useState<ITeamWithMembers | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [editingMember, setEditingMember] = useState<IMember | null>(null);

  const [form] = Form.useForm();
  const [TeamForm] = Form.useForm();

  const sortOptions = [
    { key: "recent", label: "Mới nhất" },
    { key: "az", label: "Theo tên (A → Z)" },
    { key: "members", label: "Theo số thành viên" },
  ];
  const [sortKey, setSortKey] = useState("recent");

  /* ================= CRUD NHÓM ================= */
  const handleAddTeam = async () => {
    try {
      const values = await TeamForm.validateFields();
      createTeam(values, {
        onSuccess: () => {
          message.success("Tạo nhóm thành công!");
          setIsAddTeamOpen(false);
          TeamForm.resetFields();
          refetchTeams();
        },
      });
    } catch {
      message.error("Lỗi khi tạo nhóm!");
    }
  };

  const handleUpdateTeam = async () => {
    if (!openTeam) return;

    try {
      const values = await TeamForm.validateFields();
      const teamId = openTeam._id ?? openTeam.id ?? "";

      const res = await API.put(`/teams/${teamId}`, values);

      message.success("Cập nhật nhóm thành công!");

      setOpenTeam({
        ...openTeam,
        ...res.data.team,
      });

      setIsEditTeamOpen(false);
      TeamForm.resetFields();
      refetchTeams();
    } catch {
      message.error("Không thể cập nhật nhóm!");
    }
  };

  const handleDeleteTeam = async () => {
    if (!openTeam) return;

    if (deleteConfirmName !== openTeam.name) {
      message.warning("Tên nhóm không khớp, không thể xoá!");
      return;
    }

    deleteTeam(openTeam._id ?? openTeam.id ?? "", {
      onSuccess: () => {
        message.success("Đã xoá nhóm thành công!");
        setOpenTeam(null);
        setIsDeleteTeamOpen(false);
        setDeleteConfirmName("");
        refetchTeams();
      },
    });
  };

  /* ================= FETCH MEMBERS ================= */
  const fetchMembers = async (teamId: string): Promise<IMember[]> => {
    try {
      const res = await API.get(`/members/team/${teamId}`);
      return res.data;
    } catch {
      message.error("Không thể tải danh sách thành viên");
      return [];
    }
  };

  /* ================= CRUD THÀNH VIÊN ================= */
  const handleSaveMember = async (values: Partial<IMember>) => {
    if (!openTeam) return;

    try {
      const teamId = openTeam._id ?? openTeam.id ?? "";
      const payload = {
        name: values.name ?? "",
        email: values.email ?? "",
        role: values.role,
        status: values.status,
        teamId,
        userId: user?.id ?? "",
      };

      // 1) Gọi API tạo thành viên
      const result = await createMember.mutateAsync(payload);

      message.success(result.message || "Thêm thành viên thành công!");

      // 2) Load danh sách members
      const res = await API.get(`/members/team/${teamId}`);

      setOpenTeam({
        ...openTeam,
        members: res.data,
      });

      setIsMemberModalOpen(false);
      setEditingMember(null);
      form.resetFields();
    } catch {
      message.error("Không thể thêm thành viên!");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!openTeam) return;

    const teamId = openTeam._id ?? openTeam.id ?? "";

    try {
      await API.delete(`/members/${memberId}`);
      message.success("Xoá thành viên thành công!");

      const res = await API.get(`/members/team/${teamId}`);

      setOpenTeam({
        ...openTeam,
        members: res.data,
      });
    } catch {
      message.error("Không thể xoá thành viên!");
    }
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

          <Button
            type="link"
            danger
            onClick={() => handleDeleteMember(record._id ?? record.id ?? "")}
          >
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
              onClick={() => setIsAddTeamOpen(true)}
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
          {(teams as ITeamWithMembers[])?.map((Team: ITeamWithMembers) => {
            const hasActive = Team.members?.some(
              (m: IMember) => m.status === MemberStatus.Active
            );

            const cardColor = Team.members?.length
              ? hasActive
                ? "#f0fff4"
                : "#fff5f5"
              : "#f7f9fa";

            return (
              <Col xs={24} sm={12} lg={8} key={Team._id}>
                <Card
                  className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  style={{ backgroundColor: cardColor }}
                  onClick={() => router.push(`/split/${Team._id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {Team.name}
                    </h3>

                    <Tag
                      color={
                        Team.members?.length === 0
                          ? "default"
                          : hasActive
                          ? "green"
                          : "red"
                      }
                      style={{ borderRadius: 8, padding: "2px 10px" }}
                    >
                      {Team.members?.length === 0
                        ? "Chưa có thành viên"
                        : hasActive
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </Tag>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex -space-x-2">
                      {Team.members?.slice(0, 4).map((m: IMember) => (
                        <Avatar
                          key={m._id}
                          src={`https://i.pravatar.cc/32?u=${m._id}`}
                          className="border-2 border-white"
                        />
                      ))}
                      {Team.members && Team.members.length > 4 && (
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 text-xs rounded-full border-2 border-white">
                          +{Team.members.length - 4}
                        </div>
                      )}
                    </div>

                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      className="text-gray-500 hover:text-blue-600"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const teamId = Team._id ?? Team.id ?? "";
                        const members = await fetchMembers(teamId);
                        setOpenTeam({ ...Team, members });
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{Team.members?.length || 0} thành viên</span>
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
              Danh sách thành viên - {openTeam?.name || ""}
            </span>
          }
          open={!!openTeam}
          onCancel={() => setOpenTeam(null)}
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
                  TeamForm.setFieldsValue({ name: openTeam?.name });
                  setIsEditTeamOpen(true);
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
              onClick={() => setIsDeleteTeamOpen(true)}
            >
              Xóa nhóm
            </Button>
          </div>

          <Table
            rowKey="_id"
            dataSource={openTeam?.members || []}
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
          onCancel={() => {
            setIsMemberModalOpen(false);
            setEditingMember(null);
          }}
          onSubmit={handleSaveMember}
          form={form}
          editingMember={editingMember}
          teamId={openTeam?._id ?? ""}
          userId={user?.id ?? ""}
        />

        {/* Modal tạo nhóm */}
        <Modal
          title="Tạo nhóm mới"
          open={isAddTeamOpen}
          onCancel={() => setIsAddTeamOpen(false)}
          onOk={handleAddTeam}
          okText="Tạo"
          cancelText="Hủy"
        >
          <Form form={TeamForm} layout="vertical">
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
          open={isEditTeamOpen}
          onCancel={() => setIsEditTeamOpen(false)}
          onOk={handleUpdateTeam}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={TeamForm} layout="vertical">
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
          open={isDeleteTeamOpen}
          onCancel={() => {
            setIsDeleteTeamOpen(false);
            setDeleteConfirmName("");
          }}
          onOk={handleDeleteTeam}
          okText="Xóa"
          okButtonProps={{ danger: true }}
          cancelText="Hủy"
        >
          <p>
            Nhập tên nhóm <b>{openTeam?.name}</b> để xác nhận xoá:
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

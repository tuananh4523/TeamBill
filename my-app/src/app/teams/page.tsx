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
  useGetTeamsQuery,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "@/hooks/api/useTeam/useTeams";
import {
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from "@/hooks/api/useMembers/useMembers";
import { useUsersQuery } from "@/hooks/api/useUser/useUsers";
import { apiClient } from "@/lib/apiClient";
import type { Team, Member, MemberStatus } from "@/types";
import MemberModal from "@/components/modal/MemberModal";
import TeamModal from "@/components/modal/TeamModal";
import AuthModal from "@/components/modal/AuthModal";

const { Title, Text } = Typography;

/* ======================== KIỂU PHỤ ======================== */
type TeamWithMembers = Team & { members: Member[] };

export default function TeamMembersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  /* ================= REACT QUERY HOOKS ================= */
  const {
    data: teams = [],
    isLoading,
    refetch: refetchTeams,
  } = useGetTeamsQuery();
  const { createTeam } = useCreateTeam();
  const { updateTeam } = useUpdateTeam();
  const { deleteTeam } = useDeleteTeam();

  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const { data: users = [] } = useUsersQuery();

  /* ================= STATE ================= */
  const [openTeam, setOpenTeam] = useState<TeamWithMembers | null>(null);
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
      await createTeam(values);
      message.success("Tạo nhóm thành công!");
      setIsAddTeamOpen(false);
      TeamForm.resetFields();
      refetchTeams();
    } catch {
      message.error("Lỗi khi tạo nhóm!");
    }
  };

  const handleUpdateTeam = async () => {
    if (!openTeam) return;

    try {
      const values = await TeamForm.validateFields();
      const teamId = openTeam._id;

      const updated = await updateTeam(teamId, values);

      message.success("Cập nhật nhóm thành công!");

      setOpenTeam({
        ...openTeam,
        ...(updated as Team),
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

    try {
      await deleteTeam(openTeam._id);
      message.success("Đã xoá nhóm thành công!");
      setOpenTeam(null);
      setIsDeleteTeamOpen(false);
      setDeleteConfirmName("");
      refetchTeams();
    } catch {
      message.error("Không thể xoá nhóm!");
    }
  };

  /* ================= FETCH MEMBERS ================= */
  const fetchMembers = async (teamId: string): Promise<Member[]> => {
    try {
      return await apiClient<Member[]>(`/members/team/${teamId}`);
    } catch {
      message.error("Không thể tải danh sách thành viên");
      return [];
    }
  };

  /* ================= CRUD THÀNH VIÊN ================= */
  const handleSaveMember = async (values: Partial<Member>) => {
    if (!openTeam) return;

    const teamId = openTeam._id;

    try {
      if (editingMember) {
        await updateMember.mutateAsync({
          id: editingMember._id,
          data: {
            name: values.name,
            email: values.email,
            role: values.role,
          },
        });
        message.success("Cập nhật thành viên thành công!");
      } else {
        await createMember.mutateAsync({
          userId: values.userId ?? user?.id ?? "",
          teamId,
          name: values.name ?? "",
          email: values.email ?? "",
          role: values.role,
        });
        message.success("Thêm thành viên thành công!");
      }

      const members = await fetchMembers(teamId);

      setOpenTeam({
        ...openTeam,
        members,
      });

      setIsMemberModalOpen(false);
      setEditingMember(null);
      form.resetFields();
    } catch {
      message.error("Không thể lưu thành viên!");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!openTeam) return;

    const teamId = openTeam._id;

    try {
      await deleteMember.mutateAsync(memberId);
      message.success("Xoá thành viên thành công!");

      const members = await fetchMembers(teamId);

      setOpenTeam({
        ...openTeam,
        members,
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
        val === "active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
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
          {(teams as TeamWithMembers[])?.map((team: TeamWithMembers) => {
            const hasMembers = team.membersCount > 0;
            const isActive = team.status === "active";

            const cardColor = hasMembers
              ? isActive
                ? "#f0fff4"
                : "#fff5f5"
              : "#f7f9fa";

            return (
              <Col xs={24} sm={12} lg={8} key={team._id}>
                <Card
                  className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  style={{ backgroundColor: cardColor }}
                  onClick={() => router.push(`/split/${team._id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {team.name}
                    </h3>

                    <Tag
                      color={
                        !hasMembers
                          ? "default"
                          : isActive
                          ? "green"
                          : "red"
                      }
                      style={{ borderRadius: 8, padding: "2px 10px" }}
                    >
                      {!hasMembers
                        ? "Chưa có thành viên"
                        : isActive
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </Tag>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex -space-x-2" />

                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      className="text-gray-500 hover:text-blue-600"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const members = await fetchMembers(team._id);
                        setOpenTeam({ ...team, members });
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{team.membersCount || 0} thành viên</span>
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
          users={users}
        />

        {/* Team Modals (Thêm / Sửa / Xoá) */}
        <TeamModal
          openAdd={isAddTeamOpen}
          openEdit={isEditTeamOpen}
          openDelete={isDeleteTeamOpen}
          openTeam={openTeam}
          deleteConfirmName={deleteConfirmName}
          teamForm={TeamForm}
          onAddCancel={() => setIsAddTeamOpen(false)}
          onEditCancel={() => setIsEditTeamOpen(false)}
          onDeleteCancel={() => {
            setIsDeleteTeamOpen(false);
            setDeleteConfirmName("");
          }}
          onAddOk={handleAddTeam}
          onEditOk={handleUpdateTeam}
          onDeleteOk={handleDeleteTeam}
          onDeleteConfirmChange={setDeleteConfirmName}
        />

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

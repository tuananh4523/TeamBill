"use client";

import React, { JSX } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tooltip,
  Space,
  Spin,
  Table,
  Empty,
  message,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { useDashboardSummary } from "@/lib/hook";
import type { IDashboardSummary } from "@/lib/hook";

const { Title, Text } = Typography;

/* ============================================================
   COMPONENT DASHBOARD PAGE
============================================================ */
export default function DashboardPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, refetch } = useDashboardSummary();
  const [showBalance, setShowBalance] = React.useState(true);

  const handleReload = async (): Promise<void> => {
    try {
      await refetch();
      message.success("Đã làm mới dữ liệu Dashboard.");
    } catch {
      message.error("Không thể làm mới dữ liệu Dashboard.");
    }
  };

  // ======================== TRẠNG THÁI AUTH ========================
  if (authLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin tip="Đang kiểm tra đăng nhập..." />
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Vui lòng đăng nhập để xem Dashboard.</Title>
      </div>
    );

  // ======================== DỮ LIỆU TỪ HOOK ========================
  const summary: IDashboardSummary | undefined = data;
  const wallet = summary?.wallet;
  const transactions = summary?.transactions ?? [];
  const totalExpenses = summary?.totalExpenses ?? 0;
  const joinedTeams = summary?.joinedTeams ?? { total: 0, list: [] };

  // ======================== GIAO DIỆN CHÍNH ========================
  return (
    <Spin spinning={isLoading}>
      <div className="min-h-screen p-6">
        {/* Header */}
        <Row justify="space-between" align="middle" className="mb-5">
          <Title level={3} className="!ml-1">
            Bảng điều khiển
          </Title>
          <Space size="middle">
            <Tooltip title="Làm mới dữ liệu">
              <Button
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={handleReload}
              />
            </Tooltip>
            <Tooltip title="Cài đặt">
              <Button shape="circle" icon={<SettingOutlined />} />
            </Tooltip>
          </Space>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Thông tin ví */}
          <Col xs={24}>
            <Card
              className="rounded-2xl border-0 shadow-sm text-white"
              style={{
                background: "linear-gradient(90deg,#2F80ED 0%,#56CCF2 100%)",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text className="text-sm text-white/90">Số dư ví</Text>
                  <Title level={3} style={{ color: "white", margin: 0 }}>
                    {wallet
                      ? showBalance
                        ? `${(wallet.balance ?? 0).toLocaleString()} ₫`
                        : "*** ₫"
                      : "—"}
                  </Title>
                  {wallet && (
                    <Text className="text-white/80 text-xs">
                      {wallet.bankAccount_holderName || "----"} •{" "}
                      {wallet.refCode}
                    </Text>
                  )}
                </Col>
                <Col>
                  <Tooltip title={showBalance ? "Ẩn số dư" : "Hiện số dư"}>
                    <Button
                      shape="circle"
                      icon={
                        showBalance ? <EyeInvisibleOutlined /> : <EyeOutlined />
                      }
                      onClick={() => setShowBalance(!showBalance)}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Thống kê nhanh */}
          <Col xs={24} lg={8}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title="Giao dịch"
            >
              <Title level={3}>{transactions.length}</Title>
              <Text type="secondary">Giao dịch đã thực hiện</Text>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title="Tổng chi tiêu"
            >
              <Title level={3}>{totalExpenses.toLocaleString()} ₫</Title>
              <Text type="secondary">Chi tiêu đã ghi nhận</Text>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title="Nhóm tham gia"
            >
              <Title level={3}>{joinedTeams.total}</Title>
              <Text type="secondary">Nhóm Team Bill của bạn</Text>
            </Card>
          </Col>

          {/* Giao dịch gần đây */}
          <Col xs={24}>
            <Card
              className="rounded-2xl shadow-sm"
              title="Giao dịch gần đây"
              extra={
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleReload}
                />
              }
            >
              {!transactions.length ? (
                <Empty description="Không có giao dịch" />
              ) : (
                <Table dataSource={transactions} pagination={false} rowKey="id">
                  <Table.Column
                    title="Mã GD"
                    dataIndex="code"
                    key="code"
                    render={(code: string) => <Text code>{code}</Text>}
                  />
                  <Table.Column
                    title="Loại"
                    dataIndex="type"
                    key="type"
                    render={(type: string) => (
                      <Text type={type === "deposit" ? "success" : "danger"}>
                        {type.toUpperCase()}
                      </Text>
                    )}
                  />
                  <Table.Column
                    title="Số tiền"
                    dataIndex="amount"
                    key="amount"
                    render={(amount: number) => `${amount.toLocaleString()} ₫`}
                  />
                  <Table.Column
                    title="Mô tả"
                    dataIndex="description"
                    key="description"
                    render={(desc?: string) => desc || "—"}
                  />
                </Table>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

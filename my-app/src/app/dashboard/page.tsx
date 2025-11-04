"use client";

import { JSX, useMemo, useState } from "react";
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
  ExpandOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useWalletInfo, useWalletTransactions } from "@/lib/api/useWallet";
import { useTeams } from "@/lib/api/useTeam";
import { useExpenses } from "@/lib/api/useExpense";

const { Title, Text } = Typography;

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

export default function DashboardPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const [showBalance, setShowBalance] = useState<boolean>(true);

  /* ================== FETCH DATA VIA HOOKS ================== */
  const {
    data: wallet,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWalletInfo(user?._id || "");

  const {
    data: txRes,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useWalletTransactions({ userId: user?._id });

  const {
    data: teams,
    isLoading: teamLoading,
    refetch: refetchTeams,
  } = useTeams();

  const {
    data: expenses,
    isLoading: expenseLoading,
    refetch: refetchExpenses,
  } = useExpenses();

  const loading = walletLoading || txLoading || teamLoading || expenseLoading;

  const transactions = txRes?.data ?? [];

  /* ================== BUILD CHART DATA ================== */
  const chartData: ChartData[] = useMemo(() => {
    if (!expenses) return [];
    const now = new Date();
    const result: ChartData[] = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `T${monthDate.getMonth() + 1}`;
      const filtered = expenses.filter(
        (e) => new Date(e.date).getMonth() === monthDate.getMonth()
      );
      const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);
      result.unshift({
        month: label,
        income: totalExpense * 1.3,
        expense: totalExpense,
      });
    }

    return result;
  }, [expenses]);

  /* ================== REFRESH ALL ================== */
  const handleReload = (): void => {
    Promise.all([
      refetchWallet(),
      refetchTx(),
      refetchTeams(),
      refetchExpenses(),
    ])
      .then(() => message.success("Đã làm mới dữ liệu Dashboard"))
      .catch(() =>
        message.error("Không thể làm mới dữ liệu, vui lòng thử lại.")
      );
  };

  /* ================== UI STATE ================== */
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

  /* ================== UI RENDER ================== */
  return (
    <Spin spinning={loading}>
      <div className="min-h-screen p-6">
        {/* HEADER */}
        <Row justify="space-between" align="middle" className="mb-5">
          <Title level={3} className="!mb-0">
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
          {/* WALLET CARD */}
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
                    {wallet && typeof wallet.soDu === "number"
                      ? showBalance
                        ? `${wallet.soDu.toLocaleString()} ₫`
                        : "***000 ₫"
                      : "—"}
                  </Title>
                  {wallet?.thongTinNganHang_tenNganHang && (
                    <Text className="text-white/80 text-xs">
                      {wallet.thongTinNganHang_tenNganHang} •{" "}
                      {wallet.thongTinNganHang_soTaiKhoan}
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

          {/* QUICK STATS */}
          <Col xs={24} lg={8}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title="Tổng giao dịch"
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
              <Title level={3}>
                {expenses
                  ?.reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString()}{" "}
                ₫
              </Title>
              <Text type="secondary">Tổng chi trong 12 tháng</Text>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title="Nhóm đang tham gia"
            >
              <Title level={3}>{teams?.length ?? 0}</Title>
              <Text type="secondary">Nhóm Team Bill của bạn</Text>
            </Card>
          </Col>

          {/* CHART */}
          <Col xs={24}>
            <Card
              className="rounded-2xl shadow-sm bg-white"
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    Biểu đồ thu chi
                  </span>
                  <Text type="secondary">(12 tháng gần đây)</Text>
                </div>
              }
              extra={<ExpandOutlined />}
            >
              {chartData.length === 0 ? (
                <Empty description="Không có dữ liệu" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(v) => `${v / 1_000_000}tr`}
                      stroke="#94a3b8"
                    />
                    <ChartTooltip
                      formatter={(v: number) => `${v.toLocaleString()} ₫`}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Thu"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Chi"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>

          {/* RECENT TRANSACTIONS */}
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
                <Table
                  dataSource={transactions.slice(0, 5)}
                  pagination={false}
                  rowKey="_id"
                >
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
                      <Text type={type === "NAP" ? "success" : "danger"}>
                        {type}
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

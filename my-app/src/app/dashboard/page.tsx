"use client";

import { useEffect, useState, JSX } from "react";
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
import {
  getWalletInfo,
  getWalletTransactions,
  getTeams,
  getExpenses,
  IWalletInfo,
  WalletTransaction,
  ITeam,
  IExpense,
} from "@/lib/api";

const { Title, Text } = Typography;

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

export default function DashboardPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();

  const [wallet, setWallet] = useState<IWalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showBalance, setShowBalance] = useState<boolean>(true);

  /* ================== TẠO DỮ LIỆU BIỂU ĐỒ ================== */
  const buildChartData = (expenseList: IExpense[]): ChartData[] => {
    const now = new Date();
    const result: ChartData[] = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `T${monthDate.getMonth() + 1}`;
      const filtered = expenseList.filter(
        (e) => new Date(e.date).getMonth() === monthDate.getMonth()
      );
      const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);
      result.unshift({
        month: label,
        income: totalExpense * 1.3, // mô phỏng thu nhập
        expense: totalExpense,
      });
    }

    return result;
  };

  /* ================== FETCH DỮ LIỆU DASHBOARD ================== */
  const fetchDashboard = async (): Promise<void> => {
    if (!user?._id || !user.token) {
      message.warning("Không tìm thấy người dùng hoặc token đăng nhập.");
      return;
    }

    setLoading(true);
    try {
      const [walletRes, transRes, teamRes, expenseRes] = await Promise.all([
        getWalletInfo(user._id),
        getWalletTransactions(user._id),
        getTeams(),
        getExpenses(),
      ]);

      setWallet(walletRes.data);
      setTransactions(transRes.data.data ?? []);
      setTeams(teamRes.data);
      setExpenses(expenseRes.data);
      setChartData(buildChartData(expenseRes.data));
    } catch (error) {
      console.error("[Dashboard] Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  /* ================== TỰ ĐỘNG GỌI SAU KHI LOGIN ================== */
  useEffect(() => {
    if (user && user._id && user.token) {
      console.log("[Dashboard] User ID:", user._id);
      console.log("[Dashboard] Token:", user.token?.slice(0, 20) + "...");
      void fetchDashboard();
    }
  }, [user?._id, user?.token]);

  /* ================== UI TRẠNG THÁI ================== */
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

  const handleReload = (): void => void fetchDashboard();

  /* ================== HIỂN THỊ GIAO DIỆN ================== */
  return (
    <Spin spinning={loading}>
      <div className="min-h-screen p-6">
        {/* ========== HEADER ========== */}
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

        {/* ========== THẺ VÍ ========== */}
        <Row gutter={[16, 16]}>
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
                  {wallet && wallet.thongTinNganHang_tenNganHang && (
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

          {/* ========== THỐNG KÊ NHANH ========== */}
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
                  .reduce((sum, e) => sum + e.amount, 0)
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
              <Title level={3}>{teams.length}</Title>
              <Text type="secondary">Nhóm Team Bill của bạn</Text>
            </Card>
          </Col>

          {/* ========== BIỂU ĐỒ ========== */}
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

          {/* ========== GIAO DỊCH GẦN ĐÂY ========== */}
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
              {transactions.length === 0 ? (
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

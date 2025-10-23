"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tooltip,
  message,
  Select,
  Space,
  Spin,
  Empty,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
  ExpandOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "http://localhost:8080/api";

interface WalletInfo {
  balance: number;
  refCode: string;
  bankInfo: {
    chuTaiKhoan: string;
    soTaiKhoan: string;
    maNganHang: string;
  };
}

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(); //  Lấy user từ context

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState("Tháng này");

useEffect(() => {
  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = user.token;

      const walletRes = await axios.get(`${API_BASE}/wallet/info`, {
        params: { userId: user.id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (walletRes.data.success) {
        setWallet({
          balance: walletRes.data.balance,
          refCode: walletRes.data.refCode,
          bankInfo: walletRes.data.bankInfo,
        });
      }

      const chartRes = await axios.get(`${API_BASE}/expenses/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sum = chartRes.data;
      const mock = [
        { month: "T1", income: sum.totalAmount || 0, expense: sum.count * 50000 },
        { month: "T2", income: sum.totalAmount / 2 || 0, expense: sum.count * 70000 },
        { month: "T3", income: sum.totalAmount / 3 || 0, expense: sum.count * 90000 },
      ];
      setChartData(mock);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu ví");
    } finally {
      setLoading(false);
    }
  };

  if (user) fetchData();
  else {
    setWallet(null);
    setChartData([]);
  }
}, [user]);


  const handleReload = () => window.location.reload();

  //  Nếu đang kiểm tra đăng nhập
  if (authLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin tip="Đang kiểm tra đăng nhập..." />
      </div>
    );

  //  Nếu chưa đăng nhập
  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Vui lòng đăng nhập để xem trang Dashboard.</Title>
      </div>
    );


  return (
    <Spin spinning={loading}>
      <div className="min-h-screen p-6">
        {/* ================= HEADER ================= */}
        <Row justify="space-between" align="middle" className="mb-5">
          <Title level={3} className="!mb-0">
            Trang chủ
          </Title>

          <Space size="middle" align="center">
            <Tooltip title="Làm mới">
              <Button
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={handleReload}
              />
            </Tooltip>

            <Tooltip title="Cài đặt">
              <Button shape="circle" icon={<SettingOutlined />} />
            </Tooltip>

            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 180 }}
              dropdownStyle={{ minWidth: 200 }}
            >
              <Option value="Tuần này">Tuần này</Option>
              <Option value="Tuần trước">Tuần trước</Option>
              <Option value="Tháng này">Tháng này</Option>
              <Option value="Tháng trước">Tháng trước</Option>
              <Option value="Quý này">Quý này</Option>
              <Option value="Quý trước">Quý trước</Option>
              <Option value="Năm nay">Năm nay</Option>
              <Option value="Năm trước">Năm trước</Option>
              <Option value="Tùy chọn">Tùy chọn</Option>
            </Select>
          </Space>
        </Row>

        {/* ================= THÂN TRANG ================= */}
        <Row gutter={[16, 16]}>
          {/* Tổng số dư */}
          <Col xs={24}>
            <Card
              className="rounded-2xl border-0 shadow-sm text-white"
              style={{
                background: "linear-gradient(90deg,#2F80ED 0%,#56CCF2 100%)",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text className="text-sm text-white/90">Tổng số dư</Text>
                  <Title level={3} style={{ color: "white", margin: 0 }}>
                    {wallet
                      ? showBalance
                        ? `${wallet.balance.toLocaleString()} ₫`
                        : "***000 ₫"
                      : "—"}
                  </Title>
                </Col>
                <Col>
                  <Tooltip title={showBalance ? "Ẩn số dư" : "Hiện số dư"}>
                    <Button
                      shape="circle"
                      icon={
                        showBalance ? (
                          <EyeInvisibleOutlined />
                        ) : (
                          <EyeOutlined />
                        )
                      }
                      onClick={() => setShowBalance(!showBalance)}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Tổng quan */}
          <Col xs={24} lg={12}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title={<span className="font-semibold">Tổng quan</span>}
              extra={<ReloadOutlined />}
            >
              <Empty description="Không có dữ liệu" />
            </Card>
          </Col>

          {/* Thu tiền */}
          <Col xs={24} lg={12}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title={<span className="font-semibold">Thu tiền</span>}
              extra={<ReloadOutlined />}
            >
              <Empty description="Không có dữ liệu" />
            </Card>
          </Col>

          {/* Chi tiền */}
          <Col xs={24} lg={12}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title={<span className="font-semibold">Chi tiền</span>}
              extra={<ReloadOutlined />}
            >
              <Empty description="Không có dữ liệu" />
            </Card>
          </Col>

          {/* Ghi chép gần đây */}
          <Col xs={24} lg={12}>
            <Card
              className="rounded-2xl shadow-sm text-center"
              title={<span className="font-semibold">Ghi chép gần đây</span>}
              extra={<ReloadOutlined />}
            >
              <Empty description="Không có dữ liệu" />
            </Card>
          </Col>

          {/* Biểu đồ thu chi */}
          <Col xs={24}>
            <Card
              className="rounded-2xl shadow-sm bg-white"
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    Tình hình thu chi
                  </span>
                  <Text type="secondary">(12 tháng gần đây)</Text>
                </div>
              }
              extra={
                <div className="flex items-center gap-2">
                  <ReloadOutlined />
                  <ExpandOutlined />
                </div>
              }
              style={{ backgroundColor: "#f0f8ff" }}
            >
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Empty description="Không có dữ liệu" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(v) => `${v / 1_000_000}tr`}
                      stroke="#94a3b8"
                    />
                    <ReTooltip
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
        </Row>
      </div>
    </Spin>
  );
}

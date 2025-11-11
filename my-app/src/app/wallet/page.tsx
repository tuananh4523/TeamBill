"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Table,
  Typography,
  message,
  Tooltip,
  ConfigProvider,
  Tabs,
  Divider,
  Spin,
  DatePicker,
  Select,
} from "antd";
import viVN from "antd/es/locale/vi_VN";
import { Upload, Copy, RefreshCcw, Filter } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import copy from "copy-to-clipboard";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import { getTransactionsByWallet, IWallet, ITransaction } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useUserWallet } from "@/lib/hook";

dayjs.locale("vi");
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

/* ================== Utils ================== */
const formatCurrency = (num: number): string =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num);

/* ================== Component dòng thông tin ================== */
function InfoRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2">
      <Text type="secondary">{label}</Text>
      <Space>
        <Text strong>{value}</Text>
        {copyable && (
          <Tooltip title="Sao chép">
            <Button
              type="text"
              size="small"
              icon={<Copy size={16} />}
              onClick={() => {
                copy(value);
                message.success("Đã sao chép");
              }}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );
}

/* ================== Thẻ Ví ================== */
function WalletCard({ balance, owner }: { balance: number; owner: string }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #007BFF 0%, #8A2BE2 100%)",
        borderRadius: 20,
        color: "white",
        padding: "24px",
        height: 190,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
        marginBottom: 16,
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            style={{
              background: "white",
              borderRadius: "50%",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/Logo.png" alt="Logo" width={42} height={42} />
          </div>
          <span className="text-base font-semibold">TEAM BILL</span>
        </div>
        <span className="text-sm font-semibold opacity-90">VÍ ĐIỆN TỬ</span>
      </div>

      <div className="text-center">
        <span className="text-3xl font-bold">{formatCurrency(balance)}</span>
        <span className="ml-1 text-base">₫</span>
        <div className="text-sm opacity-80 mt-1">Số dư khả dụng</div>
      </div>

      <div className="flex justify-between text-xs opacity-90">
        <div>CHỦ THẺ: {owner || "—"}</div>
        <div>Thẻ Team Bill</div>
      </div>
    </div>
  );
}

/* ================== Trang chính ================== */
export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    data: walletRes,
    isLoading: walletLoading,
    refetch,
  } = useUserWallet();
  const wallet: IWallet | undefined = walletRes?.data;

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filteredTx, setFilteredTx] = useState<ITransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  /* ===========================================================
     HÀM TẢI DANH SÁCH GIAO DỊCH
  ============================================================ */
  const fetchTransactions = useCallback(async (): Promise<void> => {
    if (!wallet?._id && !wallet?.id) return;
    setLoadingTx(true);
    try {
      const walletId = wallet.id || wallet._id || "";
      const { data } = await getTransactionsByWallet(walletId);
      setTransactions(data || []);
      setFilteredTx(data || []);
      console.groupCollapsed("=== [WalletPage] DỮ LIỆU VÍ ===");
      console.log("Danh sách giao dịch:", data);
      console.groupEnd();
    } catch (err) {
      console.error("[WalletPage] Lỗi tải giao dịch:", err);
      message.error("Không thể tải danh sách giao dịch.");
    } finally {
      setLoadingTx(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) void fetchTransactions();
  }, [wallet, fetchTransactions]);

  /* ===========================================================
     HÀM LỌC GIAO DỊCH
  ============================================================ */
  const handleFilter = useCallback(() => {
    let filtered = [...transactions];

    // Lọc theo ngày
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((tx) => {
        const txDate = dayjs(tx.date);
        return (
          txDate.isAfter(dateRange[0], "day") &&
          txDate.isBefore(dateRange[1], "day")
        );
      });
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    setFilteredTx(filtered);
  }, [transactions, dateRange, statusFilter]);

  useEffect(() => {
    handleFilter();
  }, [dateRange, statusFilter, transactions, handleFilter]);

  /* ===========================================================
     CẤU HÌNH CỘT BẢNG
  ============================================================ */
  const columns: ColumnsType<ITransaction> = useMemo(
    () => [
      { title: "Mã giao dịch", dataIndex: "code", align: "center" },
      {
        title: "Thời gian",
        dataIndex: "date",
        align: "center",
        render: (v: string) => (v ? dayjs(v).format("HH:mm DD/MM/YYYY") : "-"),
      },
      {
        title: "Loại",
        dataIndex: "type",
        align: "center",
        render: (t: ITransaction["type"]) => (
          <Tag
            color={
              t === "deposit"
                ? "green"
                : t === "withdraw"
                ? "volcano"
                : t === "payment"
                ? "blue"
                : "gold"
            }
            style={{ borderRadius: 6, fontWeight: 500, padding: "2px 10px" }}
          >
            {t === "deposit"
              ? "Nạp tiền"
              : t === "withdraw"
              ? "Rút tiền"
              : t === "payment"
              ? "Thanh toán"
              : "Chuyển ví"}
          </Tag>
        ),
      },
      {
        title: "Số tiền (₫)",
        dataIndex: "amount",
        align: "right",
        render: (v: number, r: ITransaction) => (
          <Text
            strong
            type={r.direction === "out" ? "danger" : "success"}
            style={{ fontSize: 13 }}
          >
            {r.direction === "out" ? "-" : "+"}
            {formatCurrency(v)}
          </Text>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        align: "center",
        render: (s: ITransaction["status"]) => (
          <Tag
            color={
              s === "completed"
                ? "success"
                : s === "pending"
                ? "processing"
                : "error"
            }
            style={{ borderRadius: 6, padding: "2px 10px" }}
          >
            {s === "completed"
              ? "Thành công"
              : s === "pending"
              ? "Đang xử lý"
              : "Thất bại"}
          </Tag>
        ),
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        align: "left",
        render: (v?: string) => v || "-",
      },
    ],
    []
  );

  /* ===========================================================
     GIAO DIỆN
  ============================================================ */
  if (authLoading || walletLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin tip="Đang tải dữ liệu ví..." />
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Vui lòng đăng nhập để xem ví của bạn.</Title>
      </div>
    );

  if (!wallet)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Không tìm thấy ví của bạn.</Title>
      </div>
    );

  return (
    <ConfigProvider locale={viVN}>
      <div className="min-h-screen p-6" style={{ backgroundColor: "#DFF2FD" }}>
        <Row justify="space-between" align="middle" className="mb-5">
          <Title level={3} className="!mb-1">
            Ví Team Bill
          </Title>
          <Button icon={<RefreshCcw size={16} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Row>

        <Row gutter={16}>
          {/* BẢNG GIAO DỊCH */}
          <Col xs={24} md={16}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 16 }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Lịch sử giao dịch
                </Title>
              </Row>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 16 }}
              >
                <Space>
                  <Select
                    style={{ width: 150 }}
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v)}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="completed">Thành công</Option>
                    <Option value="pending">Đang xử lý</Option>
                    <Option value="failed">Thất bại</Option>
                  </Select>
                  <RangePicker
                    format="DD/MM/YYYY"
                    value={dateRange}
                    onChange={(v) =>
                      setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs])
                    }
                  />
                  <Tooltip title="Đặt lại bộ lọc">
                    <Button
                      type="text"
                      icon={<Filter size={16} />}
                      onClick={() => {
                        setDateRange([null, null]);
                        setStatusFilter("all");
                      }}
                    />
                  </Tooltip>
                </Space>
              </Row>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Ví Team Bill" key="1">
                  <div style={{ fontWeight: 500, marginBottom: 10 }}>
                    Tổng tiền:{" "}
                    <span style={{ fontWeight: 700 }}>
                      {formatCurrency(wallet.balance)} ₫
                    </span>
                  </div>

                  <Table
                    bordered
                    rowKey="id"
                    loading={loadingTx}
                    columns={columns}
                    dataSource={filteredTx}
                    pagination={{
                      pageSize: 10,
                      position: ["bottomRight"],
                      showSizeChanger: false,
                    }}
                    style={{ borderRadius: 10, overflow: "hidden" }}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* THẺ VÍ */}
          <Col xs={24} md={8}>
            <WalletCard
              balance={wallet.balance}
              owner={wallet.bankAccount_holderName || "—"}
            />

            <Card className="mt-4">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button type="primary" icon={<Upload size={16} />}>
                  Nạp tiền
                </Button>
                <Button danger>Rút tiền</Button>
              </Space>

              <Divider />
              <Title level={5}>Thông tin chuyển khoản</Title>
              <InfoRow
                label="Chủ TK"
                value={wallet.bankAccount_holderName || "—"}
              />
              <InfoRow
                label="Số TK"
                value={wallet.bankAccount_number || "—"}
                copyable
              />
              <InfoRow
                label="Ngân hàng"
                value={wallet.bankAccount_bankName || "—"}
              />
              <Text type="secondary">
                Nội dung: <Text code>NAP {wallet.refCode}</Text>
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
}

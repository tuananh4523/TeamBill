"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Image,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Table,
  Modal,
  InputNumber,
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
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import copy from "copy-to-clipboard";
import type { ColumnsType } from "antd/es/table";
import { useQueryClient } from "@tanstack/react-query";
import { useGetWalletsQuery, useGetTransactionsByWallet } from "@/hooks/api";
import {
  useCreateVietQRDeposit,
  useConfirmDeposit,
} from "@/hooks/api/usePayments/usePayments";
import type { Wallet, Transaction } from "@/types";
import { useAuth } from "@/context/AuthContext";

dayjs.locale("vi");
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const formatCurrency = (num: number): string =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num);

// Component dòng thông tin
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

// Thẻ Ví
function usePrimaryWallet(
  wallets: Wallet[] | undefined,
  userId: string | undefined,
) {
  return useMemo(() => {
    if (!wallets?.length) return undefined;
    if (userId) {
      const mine = wallets.find((w) => String(w.userId) === String(userId));
      if (mine) return mine;
    }
    return wallets[0];
  }, [wallets, userId]);
}

function WalletCard({
  balance,
  owner,
  showBalance,
}: {
  balance: number;
  owner: string;
  showBalance: boolean;
}) {
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
        <span className="text-3xl font-bold">
          {showBalance ? formatCurrency(balance) : "***"}
        </span>
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

// Trang chính
export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data: wallets = [], isLoading: loadingWallets } =
    useGetWalletsQuery();
  const primaryWallet = usePrimaryWallet(wallets, user?.id);
  const walletId = primaryWallet?._id ?? "";

  useEffect(() => {
    if (walletId) {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  }, [walletId, queryClient]);

  const { data: transactions = [], isLoading: loadingTransactions } =
    useGetTransactionsByWallet(walletId);
  const [showBalance, setShowBalance] = useState(true);

  const [filteredTx, setFilteredTx] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ====== STATE NẠP TIỀN VNPAY ======
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  // ====== STATE QUẢN LÝ QR VIETQR ======
  const [qrInfo, setQrInfo] = useState<{
    qrLink: string;
    transactionId: string;
    transCode: string;
    bankInfo: {
      bankName: string;
      holderName: string;
      accountNumber: string;
    };
  } | null>(null);

  // Transactions handled by React Query hook
  const handleFilter = useCallback(() => {
    let filtered = [...transactions];

    // Lọc theo ngày
    if (dateRange[0] || dateRange[1]) {
      filtered = filtered.filter((tx) => {
        if (!tx.createdAt) return false;
        const txDate = dayjs(tx.createdAt);
        return (
          (!dateRange[0] || !txDate.isBefore(dateRange[0]!, "day")) &&
          (!dateRange[1] || !txDate.isAfter(dateRange[1]!, "day"))
        );
      });
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (tx) => (tx.status ?? "pending").toLowerCase() === statusFilter,
      );
    }

    setFilteredTx(filtered);
  }, [transactions, dateRange, statusFilter]);

  useEffect(() => {
    handleFilter();
  }, [dateRange, statusFilter, transactions, handleFilter]);

  const createVietQRMu = useCreateVietQRDeposit();
  const confirmMu = useConfirmDeposit();

  const handleCreateVietQR = useCallback(() => {
    if (!primaryWallet || !user || !depositAmount || depositAmount <= 0) {
      message.warning("Vui lòng chọn ví và nhập số tiền hợp lệ.");
      return;
    }

    const userId = user!.id;
    createVietQRMu.mutate(
      {
        walletId: primaryWallet._id!,
        data: {
          amount: depositAmount,
          userId,
        },
      },
      {
        onSuccess: (data) => {
          if (data.qrLink) {
            setQrInfo({
              qrLink: data.qrLink,
              transactionId: data.transactionId,
              transCode: data.transCode,
              bankInfo: data.bankInfo,
            });
            message.success("Tạo mã QR thành công!");
          }
        },
        onError: (error) => {
          console.error("[WalletPage] Lỗi tạo QR:", error);
          message.error("Không tạo được QR.");
        },
      },
    );
  }, [primaryWallet, user, depositAmount, createVietQRMu]);

  const columns: ColumnsType<Transaction> = useMemo(
    () => [
      { title: "Mã giao dịch", dataIndex: "code", align: "center" },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        align: "center",
        render: (v: string) => (v ? dayjs(v).format("HH:mm DD/MM/YYYY") : "-"),
      },
      {
        title: "Loại",
        dataIndex: "type",
        align: "center",
        render: (t: Transaction["type"]) => (
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
        render: (v: number, r: Transaction) => (
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
        render: (s?: string) => {
          const status = (s ?? "pending").toLowerCase();
          const colors = {
            completed: "success",
            pending: "processing",
            failed: "error" as const,
          };
          const color = colors[status as keyof typeof colors] || "default";
          const labels = {
            completed: "Thành công",
            pending: "Đang xử lý",
            failed: "Thất bại",
          };
          const label = labels[status as keyof typeof labels] || "Không rõ";
          return (
            <Tag color={color} style={{ borderRadius: 6, padding: "2px 10px" }}>
              {label}
            </Tag>
          );
        },
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        align: "left",
        render: (v?: string) => v || "-",
      },
    ],
    [],
  );

  const loading = authLoading || loadingWallets || loadingTransactions;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-xl font-medium text-gray-600">
            Đang tải dữ liệu ví...
          </div>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Vui lòng đăng nhập để xem ví của bạn.</Title>
      </div>
    );

  if (!primaryWallet)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Không tìm thấy ví của bạn.</Title>
      </div>
    );

  return (
    <ConfigProvider locale={viVN}>
      <div className="min-h-screen p-6" style={{ backgroundColor: "#DFF2FD" }}>
        <Row justify="space-between" align="middle" className="mb-5">
          <Title level={3} className="!ml-1">
            Ví Team Bill
          </Title>
          <Button
            icon={<RefreshCcw size={16} />}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["wallets"] });
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
            }}
          >
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
                      {showBalance
                        ? formatCurrency(primaryWallet.balance ?? 0)
                        : "*** ₫"}
                    </span>
                  </div>

                  <Table
                    bordered
                    rowKey="_id"
                    loading={loadingTransactions}
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
            <Space style={{ marginBottom: 8 }}>
              <Button
                shape="circle"
                icon={showBalance ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowBalance(!showBalance)}
              />
            </Space>
            <WalletCard
              balance={primaryWallet.balance ?? 0}
              owner={primaryWallet.bankAccount_holderName || "—"}
              showBalance={showBalance}
            />

            <Card className="mt-4">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<Upload size={16} />}
                  onClick={() => setDepositModalOpen(true)}
                >
                  Nạp tiền
                </Button>
                <Button danger disabled>
                  Rút tiền (sắp có)
                </Button>
              </Space>

              <Divider />
              <Title level={5}>Thông tin chuyển khoản</Title>
              <InfoRow
                label="Chủ TK"
                value={primaryWallet.bankAccount_holderName || "—"}
              />
              <InfoRow
                label="Số TK"
                value={primaryWallet.bankAccount_number || "—"}
                copyable
              />
              <InfoRow
                label="Ngân hàng"
                value={primaryWallet.bankAccount_bankName || "—"}
              />
              <Text type="secondary">
                Nội dung: <Text code>NAP {primaryWallet.refCode}</Text>
              </Text>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Nạp tiền vào ví qua ViệtQR"
          open={depositModalOpen}
          onCancel={() => {
            if (createVietQRMu.isPending || confirmMu.isPending) return;
            setDepositModalOpen(false);
            setQrInfo(null);
            setDepositAmount(null);
          }}
          footer={null}
        >
          {/* Bước 1: Nhập số tiền */}
          {!qrInfo && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text>Số tiền cần nạp (VND)</Text>
              <InputNumber
                style={{ width: "100%" }}
                min={1000}
                step={1000}
                value={depositAmount ?? undefined}
                onChange={(v) => setDepositAmount(v ?? null)}
                formatter={(value) => {
                  if (value === undefined || value === null) return "";
                  const str = String(value).replace(/\D/g, "");
                  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                }}
                parser={(value) => {
                  if (!value) return 0;
                  // Xóa toàn bộ ký tự không phải số, chuyển ".000" → 000000
                  const cleaned = value.replace(/\./g, "").replace(/\D/g, "");
                  return Number(cleaned);
                }}
                placeholder="Nhập số tiền, ví dụ: 200.000"
              ></InputNumber>

              <Button
                type="primary"
                block
                loading={createVietQRMu.isPending}
                disabled={!depositAmount || depositAmount! <= 0}
                onClick={handleCreateVietQR}
              >
                Tạo mã QR ViệtQR
              </Button>
            </Space>
          )}

          {/* Bước 2: Hiển thị QR */}
          {qrInfo && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Quét QR để nạp tiền</Text>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <Image
                  src={qrInfo.qrLink}
                  alt="VietQR"
                  width={260}
                  height={260}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #eee",
                  }}
                  preview={false}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <Text strong>Ngân hàng: </Text>
                <Text>{qrInfo.bankInfo.bankName}</Text> <br />
                <Text strong>Chủ TK: </Text>
                <Text>{qrInfo.bankInfo.holderName}</Text> <br />
                <Text strong>Số TK: </Text>
                <Text>{qrInfo.bankInfo.accountNumber}</Text> <br />
                <Text strong>Nội dung: </Text>
                <Text code>{qrInfo.transCode}</Text>
              </div>

              <Button
                block
                onClick={() => {
                  setQrInfo(null);
                  setDepositAmount(null);
                }}
              >
                Nhập lại số tiền
              </Button>
            </Space>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}

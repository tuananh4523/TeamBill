"use client";

import { useEffect, useMemo, useState } from "react";
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
  Select,
  ConfigProvider,
  Input,
  Tabs,
  Divider,
  Spin,
} from "antd";
import viVN from "antd/es/locale/vi_VN";
import { Upload, Copy, RefreshCcw } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import copy from "copy-to-clipboard";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import { getWalletInfo, getWalletTransactions } from "@/lib/api";
import { useAuth } from "@/context/AuthContext"; // ✅ Thêm dòng này

dayjs.locale("vi");
const { Title, Text } = Typography;
const { TabPane } = Tabs;

/* ================== Kiểu dữ liệu ================== */
interface BankInfo {
  chuTaiKhoan: string;
  soTaiKhoan: string;
  maNganHang: string;
}

interface ThongTinVi {
  soDu: number;
  maThamChieu: string;
  nganHang: BankInfo;
}

type TrangThaiGD = "THANHCONG" | "CHO" | "THATBAI";
type LoaiGD = "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
type HuongGD = "CONG" | "TRU";

interface GiaoDichVi {
  _id: string;
  maGD: string;
  loai: LoaiGD;
  huong: HuongGD;
  soTien: number;
  moTa?: string;
  trangThai: TrangThaiGD;
  thoiGian: string;
}

/* ================== Utils ================== */
function formatCurrency(num: number): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num);
}

/* ================== Component dòng thông tin ================== */
function Dong({
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
function TheVi({ soDu, chuThe }: { soDu: number; chuThe: string }) {
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
        <span className="text-3xl font-bold">{formatCurrency(soDu)}</span>
        <span className="ml-1 text-base">₫</span>
        <div className="text-sm opacity-80 mt-1">Số dư khả dụng</div>
      </div>

      <div className="flex justify-between text-xs opacity-90">
        <div>CHỦ THẺ: {chuThe || "—"}</div>
        <div>Thẻ Team Bill</div>
      </div>
    </div>
  );
}

/* ================== Trang chính ================== */
export default function TrangVi() {
  const { user, loading: authLoading } = useAuth(); // ✅ Dùng AuthContext
  const [thongTin, setThongTin] = useState<ThongTinVi | null>(null);
  const [gd, setGD] = useState<GiaoDichVi[]>([]);
  const [loading, setLoading] = useState(false);

  const taiDuLieu = async (): Promise<void> => {
    if (!user?._id) return; // ✅ Chỉ gọi API khi có user
    setLoading(true);
    try {
      const [tt, lichSu] = await Promise.all([
        getWalletInfo(user._id),
        getWalletTransactions(user._id),
      ]);

      setThongTin({
        soDu: tt.data.balance,
        maThamChieu: tt.data.refCode,
        nganHang: tt.data.bankInfo,
      });

      setGD(
        lichSu.data.transactions.map((g) => ({
          _id: g._id,
          maGD: g.code,
          loai: g.type,
          huong: g.direction,
          soTien: g.amount,
          moTa: g.description,
          trangThai: g.status,
          thoiGian: g.date,
        }))
      );
    } catch {
      message.error("Không tải được dữ liệu ví.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Khi user thay đổi → tự động tải dữ liệu ví mới
  useEffect(() => {
    if (user) {
      void taiDuLieu();
    } else {
      setThongTin(null);
      setGD([]);
    }
  }, [user]);

  const cot: ColumnsType<GiaoDichVi> = useMemo(
    () => [
      {
        title: "Mã giao dịch",
        dataIndex: "maGD",
        align: "center",
      },
      {
        title: "Thời gian",
        dataIndex: "thoiGian",
        align: "center",
        render: (v: string) => dayjs(v).format("HH:mm DD/MM/YYYY"),
      },
      {
        title: "Loại",
        dataIndex: "loai",
        align: "center",
        render: (t: LoaiGD) => (
          <Tag
            color={
              t === "NAP"
                ? "green"
                : t === "RUT"
                ? "volcano"
                : t === "THANHTOAN"
                ? "blue"
                : "gold"
            }
            style={{ borderRadius: 6, fontWeight: 500, padding: "2px 10px" }}
          >
            {t === "NAP"
              ? "Nạp tiền"
              : t === "RUT"
              ? "Rút tiền"
              : t === "THANHTOAN"
              ? "Thanh toán"
              : "Chuyển ví"}
          </Tag>
        ),
      },
      {
        title: "Số tiền (₫)",
        dataIndex: "soTien",
        align: "right",
        render: (v: number, r: GiaoDichVi) => (
          <Text strong type={r.huong === "TRU" ? "danger" : "success"} style={{ fontSize: 13 }}>
            {r.huong === "TRU" ? "-" : "+"}
            {formatCurrency(v)}
          </Text>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "trangThai",
        align: "center",
        render: (s: TrangThaiGD) => (
          <Tag
            color={s === "THANHCONG" ? "success" : s === "CHO" ? "processing" : "error"}
            style={{ borderRadius: 6, padding: "2px 10px" }}
          >
            {s === "THANHCONG"
              ? "Thành công"
              : s === "CHO"
              ? "Đang xử lý"
              : "Thất bại"}
          </Tag>
        ),
      },
      {
        title: "Mô tả",
        dataIndex: "moTa",
        align: "left",
        render: (v?: string) => v || "-",
      },
    ],
    []
  );

  // ✅ Hiển thị loading hoặc yêu cầu đăng nhập (không phá layout)
  if (authLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin tip="Đang kiểm tra đăng nhập..." />
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Title level={4}>Vui lòng đăng nhập để xem ví của bạn.</Title>
      </div>
    );

  return (
    <ConfigProvider locale={viVN}>
      <div className="min-h-screen p-6" style={{ backgroundColor: "#DFF2FD", borderRadius: 8 }}>
        <Row justify="space-between" align="middle" className="mb-5">
          <Title level={3} className="!mb-0">
            Ví Team Bill
          </Title>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                  Lịch sử giao dịch
                </Title>
                <Button icon={<RefreshCcw size={16} />} onClick={() => taiDuLieu()}>
                  Làm mới
                </Button>
              </Row>

              <Tabs defaultActiveKey="1">
                <TabPane tab="Ví Team Bill" key="1">
                  {/* Bộ lọc + Bảng giữ nguyên cấu trúc */}
                  <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 12 }}>
                    <Col xs={24} sm={12} md={6}>
                      <Input placeholder="Tìm kiếm giao dịch" allowClear />
                    </Col>
                    <Col xs={12} sm={6} md={6}>
                      <Select
                        defaultValue="Tất cả loại"
                        style={{ width: "100%" }}
                        options={[
                          { label: "Tất cả loại", value: "ALL" },
                          { label: "Nạp tiền", value: "NAP" },
                          { label: "Rút tiền", value: "RUT" },
                          { label: "Thanh toán", value: "THANHTOAN" },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={6}>
                      <Select
                        defaultValue="Tất cả trạng thái"
                        style={{ width: "100%" }}
                        options={[
                          { label: "Tất cả", value: "ALL" },
                          { label: "Thành công", value: "THANHCONG" },
                          { label: "Đang xử lý", value: "CHO" },
                          { label: "Thất bại", value: "THATBAI" },
                        ]}
                      />
                    </Col>
                    <Col xs={12} sm={6} md={6}>
                      <Select
                        defaultValue="Tất cả báo cáo"
                        style={{ width: "100%" }}
                        options={[
                          { label: "Tất cả", value: "ALL" },
                          { label: "Có báo cáo", value: "Có" },
                          { label: "Không báo cáo", value: "Không" },
                        ]}
                      />
                    </Col>
                  </Row>

                  <div style={{ fontWeight: 500, marginBottom: 10 }}>
                    Tổng tiền:{" "}
                    <span style={{ fontWeight: 700 }}>
                      {formatCurrency(thongTin?.soDu ?? 0)} ₫
                    </span>
                  </div>

                  <Table
                    bordered
                    rowKey="_id"
                    loading={loading}
                    columns={cot}
                    dataSource={gd}
                    pagination={{
                      pageSize: 10,
                      position: ["bottomRight"],
                      showSizeChanger: false,
                    }}
                    style={{ borderRadius: 10, overflow: "hidden" }}
                  />

                  <div className="flex justify-between items-center mt-3 text-gray-600 text-sm">
                    <span>Tổng số: {gd.length}</span>
                    <span>
                      Số dòng/trang:
                      <Select
                        defaultValue={10}
                        options={[{ value: 10, label: "10" }]}
                        style={{ width: 70, marginLeft: 6 }}
                      />
                    </span>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Phần phải giữ nguyên */}
          <Col xs={24} md={8}>
            <TheVi soDu={thongTin?.soDu ?? 0} chuThe={thongTin?.nganHang.chuTaiKhoan || "—"} />

            <Card className="mt-4">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button type="primary" icon={<Upload size={16} />}>
                  Nạp tiền
                </Button>
                <Button danger>Rút tiền</Button>
              </Space>

              <Divider />
              <Title level={5}>Thông tin chuyển khoản</Title>
              <Dong label="Chủ TK" value={thongTin?.nganHang.chuTaiKhoan || "—"} />
              <Dong label="Số TK" value={thongTin?.nganHang.soTaiKhoan || "—"} copyable />
              <Dong label="Ngân hàng" value={thongTin?.nganHang.maNganHang || "—"} />
              <Text type="secondary">
                Nội dung: <Text code>NAP {thongTin?.maThamChieu}</Text>
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
}

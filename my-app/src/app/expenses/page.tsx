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
  Divider,
  message,
  Tooltip,
  DatePicker,
  Select,
  ConfigProvider,
  Modal,
  InputNumber,
  Input,
} from "antd";
import viVN from "antd/es/locale/vi_VN";
import { Wallet as IconVi, RefreshCcw, Upload, Copy } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import copy from "copy-to-clipboard";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import axios, { AxiosResponse } from "axios";

dayjs.locale("vi");

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

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

interface GiaoDichViAPI {
  _id: string;
  code: string;
  type: LoaiGD;
  direction: HuongGD;
  amount: number;
  description?: string;
  status: TrangThaiGD;
  date: string;
}

interface TaoQRResponse {
  success: boolean;
  qrDataURL: string;
  qrCode: string;
}

interface RutTienRequest {
  soTien: number;
  nganHang: string;
  soTaiKhoan: string;
  chuTaiKhoan: string;
}

interface RutTienResponse {
  success: boolean;
  message: string;
}

/* ================== API ================== */
async function layThongTinVi(): Promise<ThongTinVi> {
  const res: AxiosResponse<{
    balance: number;
    refCode: string;
    bankInfo: BankInfo;
  }> = await axios.get(`${API_BASE}/wallet/info`, { withCredentials: true });
  return {
    soDu: res.data.balance,
    maThamChieu: res.data.refCode,
    nganHang: res.data.bankInfo,
  };
}

async function layLichSuGD(): Promise<GiaoDichVi[]> {
  const res: AxiosResponse<GiaoDichViAPI[]> = await axios.get(
    `${API_BASE}/wallet/transactions`,
    { withCredentials: true }
  );
  return res.data.map((g) => ({
    _id: g._id,
    maGD: g.code,
    loai: g.type,
    huong: g.direction,
    soTien: g.amount,
    moTa: g.description,
    trangThai: g.status,
    thoiGian: g.date,
  }));
}

async function taoQR(soTien: number, noiDung: string): Promise<TaoQRResponse> {
  const res: AxiosResponse<TaoQRResponse> = await axios.post(
    `${API_BASE}/wallet/qr`,
    { soTien, noiDung },
    { withCredentials: true }
  );
  return res.data;
}

async function rutTienAPI(data: RutTienRequest): Promise<RutTienResponse> {
  const res: AxiosResponse<RutTienResponse> = await axios.post(
    `${API_BASE}/wallet/withdraw`,
    data,
    { withCredentials: true }
  );
  return res.data;
}

async function taoViMoi(): Promise<{ success: boolean; message: string }> {
  const res: AxiosResponse<{ success: boolean; message: string }> =
    await axios.post(
      `${API_BASE}/wallet/create`,
      {},
      { withCredentials: true }
    );
  return res.data;
}

/* ========== New: API nạp tiền ========== */
/**
 * Gọi API để lưu giao dịch nạp tiền.
 * Backend nên nhận body: { amount, method, note, sourceLink, refCode } và trả về success:true/false.
 */
async function napTienAPI(payload: {
  amount: number;
  method?: string;
  note?: string;
  sourceLink?: string;
  refCode?: string;
}): Promise<{ success: boolean; message?: string }> {
  const res: AxiosResponse<{ success: boolean; message?: string }> =
    await axios.post(`${API_BASE}/wallet/deposit`, payload, {
      withCredentials: true,
    });
  return res.data;
}

/* ================== Utils ================== */
function formatCurrency(num: number): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    num
  );
}

/* ================== Thẻ Ví ================== */
function TheVi({
  soDu,
  chuThe,
  logo = "/Logo.png",
  taoThanhCong = false,
}: {
  soDu: number;
  chuThe: string;
  logo?: string;
  taoThanhCong?: boolean;
}) {
  return (
    <div
      className={`transition-all duration-500 ${
        taoThanhCong ? "animate-glow" : ""
      }`}
      style={{
        background: "linear-gradient(135deg, #007BFF 0%, #8A2BE2 100%)",
        borderRadius: 20,
        color: "white",
        padding: "24px",
        height: 190,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
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
            <Image src={logo} alt="Logo" width={42} height={42} />
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
        <div>CHỦ THẺ: {chuThe}</div>
        <div>Thẻ Team Bill</div>
      </div>
    </div>
  );
}

/* ================== Trang chính ================== */
export default function TrangVi() {
  const [thongTin, setThongTin] = useState<ThongTinVi | null>(null);
  const [gd, setGD] = useState<GiaoDichVi[]>([]);
  const [gdLoc, setGDLoc] = useState<GiaoDichVi[]>([]);
  const [loading, setLoading] = useState(false);
  const [khoangNgay, setKhoangNgay] = useState<[Dayjs, Dayjs] | null>(null);
  const [locLoai, setLocLoai] = useState<string>("ALL");

  const [moQR, setMoQR] = useState(false);
  const [qrData, setQrData] = useState<TaoQRResponse | null>(null);
  const [moQRVietQR, setMoQRVietQR] = useState(false);
  const [moRut, setMoRut] = useState(false);
  const [soTienRut, setSoTienRut] = useState(100000);
  const [nganHangRut, setNganHangRut] = useState("");
  const [soTaiKhoanRut, setSoTaiKhoanRut] = useState("");
  const [chuTaiKhoanRut, setChuTaiKhoanRut] = useState("");
  const [moTaoVi, setMoTaoVi] = useState(false);
  const [taoThanhCong, setTaoThanhCong] = useState(false);

  // New: amount input for deposit confirmation
  const [napAmount, setNapAmount] = useState<number>(100000);

  const taiDuLieu = async (): Promise<void> => {
    setLoading(true);
    try {
      const [tt, lichSu] = await Promise.all([layThongTinVi(), layLichSuGD()]);
      setThongTin(tt);
      setGD(lichSu);
      setGDLoc(lichSu);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setMoTaoVi(true);
        } else {
          message.error("Không tải được dữ liệu ví.");
        }
      } else {
        console.error("Lỗi không xác định:", err);
        message.error("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void taiDuLieu();
  }, []);

  const locDuLieu = (range: [Dayjs, Dayjs] | null, loai: string): void => {
    let kq = [...gd];
    if (range) {
      const [start, end] = range;
      kq = kq.filter((g) => {
        const d = dayjs(g.thoiGian);
        return d.isAfter(start.startOf("day")) && d.isBefore(end.endOf("day"));
      });
    }
    if (loai !== "ALL") kq = kq.filter((g) => g.loai === loai);
    setGDLoc(kq);
  };

  const cot: ColumnsType<GiaoDichVi> = useMemo(
    () => [
      {
        title: "Thời gian",
        dataIndex: "thoiGian",
        render: (v: string) => dayjs(v).format("HH:mm DD/MM/YYYY"),
      },
      {
        title: "Loại",
        dataIndex: "loai",
        render: (t: LoaiGD) => (
          <Tag
            color={
              t === "NAP"
                ? "green"
                : t === "THANHTOAN"
                ? "blue"
                : t === "RUT"
                ? "volcano"
                : "gold"
            }
          >
            {t === "NAP"
              ? "Nạp tiền"
              : t === "THANHTOAN"
              ? "Thanh toán"
              : t === "RUT"
              ? "Rút tiền"
              : "Chuyển ví"}
          </Tag>
        ),
      },
      { title: "Mô tả", dataIndex: "moTa" },
      {
        title: "Số tiền (₫)",
        dataIndex: "soTien",
        align: "right",
        render: (v: number, r: GiaoDichVi) => (
          <Text type={r.huong === "TRU" ? "danger" : "success"}>
            {r.huong === "TRU" ? "-" : "+"}
            {formatCurrency(v)}
          </Text>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "trangThai",
        render: (s: TrangThaiGD) => (
          <Tag
            color={s === "THANHCONG" ? "green" : s === "CHO" ? "processing" : "red"}
          >
            {s === "THANHCONG" ? "Thành công" : s === "CHO" ? "Đang xử lý" : "Thất bại"}
          </Tag>
        ),
      },
    ],
    []
  );

  /* ========== Deposit confirm handler ========== */
  const onConfirmDeposit = async () => {
    if (!napAmount || napAmount <= 0) {
      message.warning("Vui lòng nhập số tiền nạp hợp lệ.");
      return;
    }
    try {
      message.loading({ content: "Đang ghi nhận giao dịch...", key: "nap" });
      const res = await napTienAPI({
        amount: napAmount,
        method: "VietQR",
        note: `NAP ${thongTin?.maThamChieu ?? ""}`,
        sourceLink: "https://img.vietqr.io/image/MB-3666904052003-qr_only.png",
        refCode: thongTin?.maThamChieu,
      });
      if (res.success) {
        message.success({ content: "Nạp tiền đã được ghi nhận.", key: "nap" });
        // Cập nhật số dư cục bộ tức thì để UI phản hồi nhanh (sau đó taiDuLieu sẽ fetch từ server)
        setThongTin((prev) =>
          prev ? { ...prev, soDu: prev.soDu + napAmount } : prev
        );
        setMoQRVietQR(false);
        // reload dữ liệu từ backend để đồng bộ (lịch sử, trạng thái thực)
        await taiDuLieu();
      } else {
        message.error(res.message || "Không thể ghi nhận nạp tiền.");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi gọi API nạp tiền.");
    }
  };

  return (
    <ConfigProvider locale={viVN}>
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 0 rgba(0,0,255,0); transform: scale(1); }
          25% { box-shadow: 0 0 25px rgba(0,255,255,0.6); transform: scale(1.03); }
          50% { box-shadow: 0 0 35px rgba(138,43,226,0.9); transform: scale(1.06); }
          100% { box-shadow: 0 0 0 rgba(0,0,255,0); transform: scale(1); }
        }
        .animate-glow { animation: glow 1.5s ease-in-out 2; }
      `}</style>

      <div className="p-4">
        <Row justify="space-between" align="middle" className="mb-4">
          <Space>
            <IconVi size={28} />
            <Title level={3}>Ví điện tử Team Bill</Title>
          </Space>
          <Button
            onClick={() => void taiDuLieu()}
            icon={<RefreshCcw size={16} />}
          >
            Làm mới
          </Button>
        </Row>

        {/* Modal mở ví */}
        <Modal
          title="Xác nhận mở ví Team Bill"
          open={moTaoVi}
          onCancel={() => setMoTaoVi(false)}
          okText="Mở ví"
          cancelText="Hủy"
          onOk={async () => {
            try {
              const res = await taoViMoi();
              if (res.success) {
                message.success("Ví Team Bill đã được tạo thành công!");
                setMoTaoVi(false);
                setTaoThanhCong(true);
                setTimeout(() => setTaoThanhCong(false), 3000);
                await taiDuLieu();
              } else {
                message.error(res.message || "Không thể tạo ví mới");
              }
            } catch {
              message.error("Không thể tạo ví mới");
            }
          }}
        >
          <p>
            Bạn chưa có ví Team Bill. Nhấn <b>Mở ví</b> để khởi tạo ví điện tử
            cho tài khoản của bạn.
          </p>
        </Modal>

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <Title level={5}>Lịch sử giao dịch</Title>
                <Space>
                  <RangePicker
                    onChange={(val) => {
                      setKhoangNgay(val as [Dayjs, Dayjs] | null);
                      locDuLieu(val as [Dayjs, Dayjs] | null, locLoai);
                    }}
                    value={khoangNgay || undefined}
                  />
                  <Select
                    style={{ width: 160 }}
                    value={locLoai}
                    onChange={(v) => {
                      setLocLoai(v);
                      locDuLieu(khoangNgay, v);
                    }}
                    options={[
                      { label: "Tất cả", value: "ALL" },
                      { label: "Nạp tiền", value: "NAP" },
                      { label: "Rút tiền", value: "RUT" },
                      { label: "Thanh toán", value: "THANHTOAN" },
                      { label: "Chuyển ví", value: "CHUYEN" },
                    ]}
                  />
                </Space>
              </div>
              <Table
                rowKey="_id"
                loading={loading}
                columns={cot}
                dataSource={gdLoc}
                pagination={{ pageSize: 5 }}
                scroll={{ y: 400 }}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <TheVi
              soDu={thongTin?.soDu ?? 0}
              chuThe={thongTin?.nganHang.chuTaiKhoan || "—"}
              taoThanhCong={taoThanhCong}
            />

            <Card className="mt-4">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<Upload size={16} />}
                  onClick={() => {
                    // reset default nap amount (ví dụ đặt bằng 100k)
                    setNapAmount(100000);
                    setMoQRVietQR(true);
                  }}
                >
                  Nạp tiền
                </Button>

                <Button danger onClick={() => setMoRut(true)}>
                  Rút tiền
                </Button>
              </Space>

              <Divider />
              <Title level={5}>Thông tin chuyển khoản</Title>
              <Dong
                label="Chủ TK"
                value={thongTin?.nganHang.chuTaiKhoan || "—"}
              />
              <Dong
                label="Số TK"
                value={thongTin?.nganHang.soTaiKhoan || "—"}
                copyable
              />
              <Dong
                label="Ngân hàng"
                value={thongTin?.nganHang.maNganHang || "—"}
              />
              <Text type="secondary">
                Nội dung: <Text code>NAP {thongTin?.maThamChieu}</Text>
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Modal QR VietQR từ backend */}
        <Modal
          title="QR Nạp tiền"
          open={moQR}
          onCancel={() => setMoQR(false)}
          footer={null}
        >
          <div className="flex justify-center py-2">
            {qrData?.qrDataURL ? (
              <Image
                src={qrData.qrDataURL}
                alt="VietQR"
                width={240}
                height={240}
              />
            ) : (
              <Text type="secondary">Đang tạo QR...</Text>
            )}
          </div>
          <Text type="secondary">
            Nội dung: <Text code>NAP {thongTin?.maThamChieu}</Text>
          </Text>
        </Modal>

        {/* Modal QR VietQR link trực tiếp (Đã thay bằng link bạn cung cấp) */}
        <Modal
          title="QR Nạp tiền (VietQR)"
          open={moQRVietQR}
          onCancel={() => setMoQRVietQR(false)}
          okText="Đã nạp xong"
          cancelText="Hủy"
          onOk={async () => {
            // Khi user bấm "Đã nạp xong" -> gọi API lưu giao dịch nạp
            await onConfirmDeposit();
          }}
        >
          <div className="flex justify-center py-2">
            {/* <-- Thay link ở đây --> */}
            <img
              src="https://img.vietqr.io/image/MB-3666904052003-qr_only.png"
              alt="VietQR MB"
              style={{ width: 240, height: 240, objectFit: "contain" }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Bạn có thể mở app ngân hàng để quét QR trên hoặc tải ảnh QR và chuyển khoản.</Text>
            </div>

            <div style={{ marginBottom: 8 }}>
              <Text strong>Nhập số tiền bạn đã chuyển (₫)</Text>
              <InputNumber
                min={1000}
                step={1000}
                value={napAmount}
                onChange={(v) => setNapAmount(v || 0)}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                parser={(val) => (val ? parseInt(val.replace(/\./g, ""), 10) : 0)}
                className="w-full"
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <Text type="secondary">Nội dung chuyển khoản đề nghị: <Text code>NAP {thongTin?.maThamChieu}</Text></Text>
            </div>

            <div className="text-center mt-2">
              <a
                href="https://img.vietqr.io/image/MB-3666904052003-qr_only.png"
                target="_blank"
                rel="noreferrer"
              >
                Mở ảnh VietQR trong tab mới
              </a>
            </div>

            <div style={{ marginTop: 10 }}>
              <Text type="secondary">Lưu ý: hệ thống sẽ ghi nhận yêu cầu nạp theo số tiền bạn nhập, sau đó backend sẽ xử lý cập nhật số dư (và có thể xác thực giao dịch bên ngân hàng nếu cần).</Text>
            </div>
          </div>
        </Modal>

        {/* Modal Rút tiền */}
        <Modal
          title="Yêu cầu rút tiền"
          open={moRut}
          onCancel={() => setMoRut(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          onOk={async () => {
            if (
              !soTienRut ||
              !nganHangRut ||
              !soTaiKhoanRut ||
              !chuTaiKhoanRut
            ) {
              message.warning("Vui lòng nhập đầy đủ thông tin");
              return;
            }
            if (thongTin && soTienRut > thongTin.soDu) {
              message.error("Số dư không đủ");
              return;
            }
            const res = await rutTienAPI({
              soTien: soTienRut,
              nganHang: nganHangRut,
              soTaiKhoan: soTaiKhoanRut,
              chuTaiKhoan: chuTaiKhoanRut,
            });
            if (res.success) {
              message.success("Yêu cầu rút tiền đã gửi thành công");
              setMoRut(false);
              await taiDuLieu();
            } else {
              message.error(res.message || "Không rút được tiền");
            }
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Tài khoản của bạn
            </div>
            <div
              style={{
                padding: "10px 12px",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                background: "#fafafa",
              }}
            >
              {thongTin?.nganHang.soTaiKhoan} - {thongTin?.nganHang.chuTaiKhoan}
              <div style={{ marginTop: 4, fontSize: 13, color: "#555" }}>
                Số dư: <b>{formatCurrency(thongTin?.soDu ?? 0)} ₫</b>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Người nhận</div>
            <Select
              placeholder="Chọn ngân hàng"
              className="w-full"
              value={nganHangRut}
              onChange={setNganHangRut}
              style={{ marginBottom: 10 }}
              options={[
                { label: "Ngoại thương Việt Nam (VCB)", value: "VCB" },
                {
                  label: "Kỹ thương Việt Nam (Techcombank - TCB)",
                  value: "TCB",
                },
                { label: "Quân đội (MB Bank)", value: "MB" },
                { label: "Đầu tư và Phát triển (BIDV)", value: "BIDV" },
                { label: "Nông nghiệp & PTNT (Agribank)", value: "AGRIBANK" },
                { label: "Á Châu (ACB)", value: "ACB" },
                { label: "Sài Gòn Thương Tín (Sacombank)", value: "SACOMBANK" },
                {
                  label: "Công thương Việt Nam (VietinBank)",
                  value: "VIETINBANK",
                },
                { label: "Việt Nam Thịnh Vượng (VPBank)", value: "VPBANK" },
                { label: "Sài Gòn - Hà Nội (SHB)", value: "SHB" },
              ]}
            />

            <Input
              placeholder="Số tài khoản"
              value={soTaiKhoanRut}
              onChange={(e) => setSoTaiKhoanRut(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <Input
              placeholder="Tên chủ tài khoản"
              value={chuTaiKhoanRut}
              onChange={(e) => setChuTaiKhoanRut(e.target.value)}
            />
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Số tiền</div>
            <InputNumber
              min={50000}
              step={50000}
              value={soTienRut}
              onChange={(v) => setSoTienRut(v || 0)}
              className="w-full"
              style={{ width: "100%" }}
              formatter={(val) =>
                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(val) => (val ? parseInt(val.replace(/\./g, ""), 10) : 0)}
              placeholder="Nhập số tiền cần rút"
            />
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
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

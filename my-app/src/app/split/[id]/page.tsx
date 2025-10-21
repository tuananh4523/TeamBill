"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Spin,
  message,
  List,
  DatePicker,
  Select,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  ConfigProvider,
  Card,
} from "antd";
import viVN from "antd/es/locale/vi_VN";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/vi";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { Category } from "@/app/categories/page";
import SplitBillForm from "@/components/Modals/SplitBillModal";
import { ROUTER_PATH } from "@/app/routerPath";

dayjs.locale("vi");
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ================== Types ================== */
export type Participant = {
  id: string;
  name: string;
  email: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  teamId: string;
  total: number;
  categoryId: string;
  note?: string;
  participants?: Participant[];
};

/* ================== Expense Modal ================== */
type ExpenseModalProps = {
  open: boolean;
  event: CalendarEvent | null;
  categories: Category[];
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
};

function ExpenseModal({
  open,
  event,
  categories,
  onClose,
  onSave,
}: ExpenseModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (event) {
      form.setFieldsValue({
        ...event,
        start: dayjs(event.start),
      });
    } else {
      form.resetFields();
    }
  }, [event, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newEvent: CalendarEvent = {
        id: event ? event.id : String(Date.now()),
        title: values.title,
        start: values.start.toISOString(),
        total: values.total,
        categoryId: values.categoryId,
        note: values.note,
        teamId: event ? event.teamId : "temp",
      };
      onSave(newEvent);
    });
  };

  return (
    <Modal
      title={event ? "Sửa chi tiêu" : "Thêm chi tiêu"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{
        className:
          "rounded-full bg-blue-500 hover:bg-blue-600 border-none px-6 py-2 font-medium shadow text-white",
      }}
      cancelButtonProps={{
        className:
          "rounded-full border border-gray-300 px-6 py-2 font-medium text-gray-600 hover:bg-gray-100",
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên chi tiêu"
          name="title"
          rules={[{ required: true, message: "Nhập tên chi tiêu" }]}
        >
          <Input placeholder="Ví dụ: Cơm trưa" />
        </Form.Item>
        <Form.Item
          label="Ngày giờ"
          name="start"
          rules={[{ required: true, message: "Chọn ngày giờ" }]}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>
        <Form.Item
          label="Số tiền (VNĐ)"
          name="total"
          rules={[{ required: true, message: "Nhập số tiền" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={1000}
            placeholder="Nhập số tiền"
          />
        </Form.Item>
        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true, message: "Chọn danh mục" }]}
        >
          <Select
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            placeholder="Chọn danh mục"
          />
        </Form.Item>
        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea placeholder="Thêm ghi chú" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/* ================== Main Page ================== */
export default function SplitPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter(); // ✅ Sử dụng router
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false); // ✅ Giữ và sử dụng

  const [categories] = useState<Category[]>([
    { id: "1", name: "Ăn uống", color: "blue" },
    { id: "2", name: "Shopping", color: "red" },
    { id: "3", name: "Cafe", color: "purple" },
    { id: "4", name: "Đi lại", color: "green" },
    { id: "5", name: "Giải trí", color: "gold" },
    { id: "6", name: "Khác", color: "gray" },
  ]);

  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

    // ========== Fake Events ==========
  useEffect(() => {
    if (!id) return;
    const fake: CalendarEvent[] = [
      {
        id: "1",
        title: "Cơm trưa",
        start: "2025-09-20T12:00:00",
        teamId: String(id),
        total: 50000,
        categoryId: "1",
        note: "Ăn trưa văn phòng",
      },
      {
        id: "2",
        title: "Lẩu nướng",
        start: "2025-09-21T18:30:00",
        teamId: String(id),
        total: 300000,
        categoryId: "1",
        note: "Đi ăn cùng nhóm bạn",
      },
      {
        id: "3",
        title: "Bún chả",
        start: "2025-09-22T13:00:00",
        teamId: String(id),
        total: 70000,
        categoryId: "1",
        note: "Ăn ngoài hàng",
      },
      {
        id: "4",
        title: "Mua áo sơ mi",
        start: "2025-09-20T16:00:00",
        teamId: String(id),
        total: 250000,
        categoryId: "2",
        note: "Mua ở trung tâm thương mại",
      },
      {
        id: "5",
        title: "Mua giày",
        start: "2025-09-22T15:00:00",
        teamId: String(id),
        total: 800000,
        categoryId: "2",
        note: "Sneaker Adidas",
      },
      {
        id: "6",
        title: "Mua sách",
        start: "2025-09-23T10:00:00",
        teamId: String(id),
        total: 150000,
        categoryId: "2",
        note: "Sách kỹ năng sống",
      },
      {
        id: "7",
        title: "Mua balo laptop",
        start: "2025-09-25T17:00:00",
        teamId: String(id),
        total: 400000,
        categoryId: "2",
        note: "Balo để đi học",
      },
      {
        id: "8",
        title: "Cafe sáng",
        start: "2025-09-21T09:00:00",
        teamId: String(id),
        total: 45000,
        categoryId: "3",
        note: "Cafe Highland",
      },
      {
        id: "9",
        title: "Cafe meeting",
        start: "2025-09-22T11:00:00",
        teamId: String(id),
        total: 60000,
        categoryId: "3",
        note: "Họp nhóm ở Starbucks",
      },
      {
        id: "10",
        title: "Cafe tối",
        start: "2025-09-23T21:00:00",
        teamId: String(id),
        total: 50000,
        categoryId: "3",
        note: "Uống cà phê tối",
      },
      {
        id: "11",
        title: "Xe bus",
        start: "2025-09-21T08:00:00",
        teamId: String(id),
        total: 7000,
        categoryId: "4",
        note: "Vé xe bus đi làm",
      },
      {
        id: "12",
        title: "Grab",
        start: "2025-09-22T19:00:00",
        teamId: String(id),
        total: 120000,
        categoryId: "4",
        note: "Đi Grab về nhà",
      },
      {
        id: "13",
        title: "Taxi",
        start: "2025-09-23T23:00:00",
        teamId: String(id),
        total: 200000,
        categoryId: "4",
        note: "Đi taxi khuya",
      },
      {
        id: "14",
        title: "Xem phim",
        start: "2025-09-22T20:00:00",
        teamId: String(id),
        total: 120000,
        categoryId: "5",
        note: "CGV Vincom",
      },
      {
        id: "15",
        title: "Karaoke",
        start: "2025-09-23T21:00:00",
        teamId: String(id),
        total: 400000,
        categoryId: "5",
        note: "Đi hát với bạn bè",
      },
      {
        id: "16",
        title: "Chơi game",
        start: "2025-09-24T15:00:00",
        teamId: String(id),
        total: 80000,
        categoryId: "5",
        note: "Nạp game",
      },
      {
        id: "17",
        title: "Quà sinh nhật",
        start: "2025-09-23T19:00:00",
        teamId: String(id),
        total: 300000,
        categoryId: "6",
        note: "Mua quà cho bạn",
      },
      {
        id: "18",
        title: "Ủng hộ từ thiện",
        start: "2025-09-24T10:00:00",
        teamId: String(id),
        total: 200000,
        categoryId: "6",
        note: "Ủng hộ vùng lũ",
      },
      {
        id: "19",
        title: "Mua cây cảnh",
        start: "2025-09-24T18:00:00",
        teamId: String(id),
        total: 180000,
        categoryId: "6",
        note: "Cây để bàn",
      },
      {
        id: "20",
        title: "Đóng tiền điện",
        start: "2025-09-25T09:00:00",
        teamId: String(id),
        total: 500000,
        categoryId: "6",
        note: "Hóa đơn tháng 9",
      },
    ];
    setEvents(fake);
    setFilteredEvents(fake);
  }, [id]);

  useEffect(() => {
    let filtered = [...events];
    if (range[0] && range[1]) {
      filtered = filtered.filter((e) =>
        dayjs(e.start).isBetween(range[0], range[1], "day", "[]")
      );
    }
    if (filterCategory !== "all") {
      filtered = filtered.filter((e) => e.categoryId === filterCategory);
    }
    setFilteredEvents(filtered);
  }, [range, filterCategory, events]);

  const handleSaveEvent = (newEvent: CalendarEvent) => {
    let updated: CalendarEvent[];
    if (editingEvent) {
      updated = events.map((e) => (e.id === newEvent.id ? newEvent : e));
      message.success("Cập nhật thành công!");
    } else {
      updated = [...events, newEvent];
      message.success("Thêm chi tiêu thành công!");
    }
    setEvents(updated);
    setIsSplitModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <ConfigProvider locale={viVN}>
      <div className="min-h-screen font-sans text-gray-800 p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Quản lý chi tiêu</h1>
        <p className="text-gray-500 mb-5">
          Theo dõi và quản lý toàn bộ chi tiêu trong nhóm
        </p>

        <Spin spinning={loading}>
          <div className="flex gap-6 items-start">
            {/* Sidebar phụ bên phải */}
            <div className="w-[320px] sticky top-4 self-start">
              <Card
                size="small"
                title={<span className="font-semibold">Chia hoá đơn</span>}
                className="bg-white rounded-xl shadow-md"
              >
                <SplitBillForm selectedDate={dayjs()} />
              </Card>
            </div>

            {/* Khu vực chính */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-700">
                  Danh sách chi tiêu
                </h2>
                <Space wrap>
                  <RangePicker
                    format="DD/MM/YYYY"
                    value={range}
                    onChange={(val) =>
                      setRange(val as [Dayjs | null, Dayjs | null])
                    }
                  />
                  <Select
                    value={filterCategory}
                    onChange={(val) => setFilterCategory(val)}
                    style={{ width: 150 }}
                  >
                    <Select.Option value="all">Tất cả</Select.Option>
                    {categories.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 border-none px-5 py-2 font-medium shadow text-white"
                    onClick={() => {
                      setEditingEvent(null);
                      setIsSplitModalOpen(true);
                    }}
                  >
                    Thêm chi tiêu
                  </Button>
                </Space>
              </div>

              {/* Danh sách chi tiêu */}
              <div className="space-y-4 max-h-[100vh] overflow-y-auto shadow-lg">
                {Object.entries(
                  filteredEvents.reduce((acc, ev) => {
                    const day = dayjs(ev.start).format("YYYY-MM-DD");
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(ev);
                    return acc;
                  }, {} as Record<string, CalendarEvent[]>)
                ).map(([day, dayEvents]) => {
                  const totalDay = dayEvents.reduce(
                    (sum, ev) => sum + (ev.total || 0),
                    0
                  );

                  return (
                    <div key={day} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-base text-gray-700">
                          {dayjs(day).format("dddd, DD/MM/YYYY")}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Tổng: {totalDay.toLocaleString()} VNĐ
                        </span>
                      </div>

                      <List
                        bordered={false}
                        dataSource={dayEvents}
                        renderItem={(ev) => {
                          const cat = categories.find(
                            (c) => c.id === ev.categoryId
                          );
                          return (
                            <List.Item
                              className="px-0"
                              actions={[
                                <EyeOutlined
                                  key="view"
                                  style={{ color: "#1677ff" }}
                                  onClick={() => {
                                    router.push(
                                      ROUTER_PATH.SPLIT.SU_KIEN?.(id, ev.id) ??
                                        `/split/${id}/event/${ev.id}`
                                    );
                                  }}
                                />,
                                <EditOutlined
                                  key="edit"
                                  style={{ color: "#000" }}
                                  onClick={() => {
                                    setEditingEvent(ev);
                                    setIsSplitModalOpen(true);
                                  }}
                                />,
                                <DeleteOutlined
                                  key="delete"
                                  style={{ color: "#ff4d4f" }}
                                  onClick={() => {
                                    setEvents((prev) =>
                                      prev.filter((e) => e.id !== ev.id)
                                    );
                                    message.success("Đã xoá sự kiện");
                                  }}
                                />,
                              ]}
                            >
                              <div className="flex justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <Tag
                                    color={cat?.color || "default"}
                                    className="min-w-[80px] text-center"
                                  >
                                    {cat?.name || "Chung"}
                                  </Tag>
                                  {ev.note && (
                                    <span className="text-gray-500 text-sm">
                                      | {ev.note}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-600 font-medium min-w-[100px] text-right">
                                  {ev.total?.toLocaleString()} VNĐ
                                </span>
                              </div>
                            </List.Item>
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Spin>

        <ExpenseModal
          open={isSplitModalOpen}
          event={editingEvent}
          categories={categories}
          onClose={() => {
            setIsSplitModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      </div>
    </ConfigProvider>
  );
}



"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Spin, Tag, Button, message, Table } from "antd";
import dayjs from "dayjs";
import { ArrowLeftOutlined } from "@ant-design/icons";

// ================== Fake Categories ==================
const categories: Category[] = [
  { id: "1", name: "Ăn uống", color: "blue" },
  { id: "2", name: "Shopping", color: "red" },
  { id: "3", name: "Cafe", color: "purple" },
  { id: "4", name: "Đi lại", color: "green" },
  { id: "5", name: "Giải trí", color: "gold" },
  { id: "6", name: "Khác", color: "gray" },
];

// ================== Types ==================
export type Participant = {
  id: string;
  name: string;
  email: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
};

type Category = {
  id: string;
  name: string;
  color: string;
  description?: string;
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

export default function EventDetailPage() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // ================== Fake Data ==================
  useEffect(() => {
    const fakeEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Cơm trưa văn phòng",
        start: "2025-09-20T12:00:00",
        teamId: String(id),
        total: 50000,
        categoryId: "1",
        note: "Ăn chung tại công ty",
        participants: [
          {
            id: "m1",
            name: "Tuấn",
            email: "tuan@example.com",
            amount: 25000,
            paid: true,
            paidAt: "2025-09-20T12:30:00",
          },
          {
            id: "m2",
            name: "An",
            email: "an@example.com",
            amount: 25000,
            paid: false,
          },
        ],
      },
      {
        id: "2",
        title: "Lẩu nướng",
        start: "2025-09-21T18:30:00",
        teamId: String(id),
        total: 300000,
        categoryId: "1",
        note: "Đi ăn cùng nhóm bạn",
        participants: [
          {
            id: "m3",
            name: "Linh",
            email: "linh@example.com",
            amount: 150000,
            paid: true,
            paidAt: "2025-09-21T19:00:00",
          },
          {
            id: "m4",
            name: "Nam",
            email: "nam@example.com",
            amount: 150000,
            paid: false,
          },
        ],
      },
      {
        id: "3",
        title: "Bún chả",
        start: "2025-09-22T13:00:00",
        teamId: String(id),
        total: 70000,
        categoryId: "1",
        note: "Ăn ngoài hàng",
        participants: [
          {
            id: "m5",
            name: "Hà",
            email: "ha@example.com",
            amount: 35000,
            paid: true,
            paidAt: "2025-09-22T13:30:00",
          },
          {
            id: "m6",
            name: "Bình",
            email: "binh@example.com",
            amount: 35000,
            paid: false,
          },
        ],
      },
      {
        id: "4",
        title: "Mua áo sơ mi",
        start: "2025-09-20T16:00:00",
        teamId: String(id),
        total: 250000,
        categoryId: "2",
        note: "Mua ở trung tâm thương mại",
        participants: [
          {
            id: "m7",
            name: "Hùng",
            email: "hung@example.com",
            amount: 125000,
            paid: true,
            paidAt: "2025-09-20T17:00:00",
          },
          {
            id: "m8",
            name: "Lan",
            email: "lan@example.com",
            amount: 125000,
            paid: false,
          },
        ],
      },
      {
        id: "5",
        title: "Mua giày",
        start: "2025-09-22T15:00:00",
        teamId: String(id),
        total: 800000,
        categoryId: "2",
        note: "Sneaker Adidas",
        participants: [
          {
            id: "m9",
            name: "Tuấn",
            email: "tuan@example.com",
            amount: 400000,
            paid: true,
            paidAt: "2025-09-22T15:30:00",
          },
          {
            id: "m10",
            name: "Nam",
            email: "nam@example.com",
            amount: 400000,
            paid: false,
          },
        ],
      },
      {
        id: "6",
        title: "Mua sách",
        start: "2025-09-23T10:00:00",
        teamId: String(id),
        total: 150000,
        categoryId: "2",
        note: "Sách kỹ năng sống",
        participants: [
          {
            id: "m11",
            name: "Hà",
            email: "ha@example.com",
            amount: 75000,
            paid: true,
            paidAt: "2025-09-23T10:15:00",
          },
          {
            id: "m12",
            name: "Linh",
            email: "linh@example.com",
            amount: 75000,
            paid: false,
          },
        ],
      },
      {
        id: "7",
        title: "Mua balo laptop",
        start: "2025-09-25T17:00:00",
        teamId: String(id),
        total: 400000,
        categoryId: "2",
        note: "Balo để đi học",
        participants: [
          {
            id: "m13",
            name: "Bình",
            email: "binh@example.com",
            amount: 200000,
            paid: true,
            paidAt: "2025-09-25T17:30:00",
          },
          {
            id: "m14",
            name: "Lan",
            email: "lan@example.com",
            amount: 200000,
            paid: false,
          },
        ],
      },
      {
        id: "8",
        title: "Cafe sáng",
        start: "2025-09-21T09:00:00",
        teamId: String(id),
        total: 45000,
        categoryId: "3",
        note: "Cafe Highland",
        participants: [
          {
            id: "m15",
            name: "Tuấn",
            email: "tuan@example.com",
            amount: 22500,
            paid: true,
            paidAt: "2025-09-21T09:15:00",
          },
          {
            id: "m16",
            name: "An",
            email: "an@example.com",
            amount: 22500,
            paid: false,
          },
        ],
      },
      {
        id: "9",
        title: "Cafe meeting",
        start: "2025-09-22T11:00:00",
        teamId: String(id),
        total: 60000,
        categoryId: "3",
        note: "Họp nhóm ở Starbucks",
        participants: [
          {
            id: "m17",
            name: "Nam",
            email: "nam@example.com",
            amount: 30000,
            paid: true,
            paidAt: "2025-09-22T11:20:00",
          },
          {
            id: "m18",
            name: "Hà",
            email: "ha@example.com",
            amount: 30000,
            paid: false,
          },
        ],
      },
      {
        id: "10",
        title: "Cafe tối",
        start: "2025-09-23T21:00:00",
        teamId: String(id),
        total: 50000,
        categoryId: "3",
        note: "Uống cà phê tối",
        participants: [
          {
            id: "m19",
            name: "Linh",
            email: "linh@example.com",
            amount: 25000,
            paid: true,
            paidAt: "2025-09-23T21:30:00",
          },
          {
            id: "m20",
            name: "Chi",
            email: "chi@example.com",
            amount: 25000,
            paid: false,
          },
        ],
      },
      {
        id: "11",
        title: "Xe bus",
        start: "2025-09-21T08:00:00",
        teamId: String(id),
        total: 7000,
        categoryId: "4",
        note: "Vé xe bus đi làm",
        participants: [
          {
            id: "m21",
            name: "Phong",
            email: "phong@example.com",
            amount: 3500,
            paid: true,
            paidAt: "2025-09-21T08:05:00",
          },
          {
            id: "m22",
            name: "Nam",
            email: "nam@example.com",
            amount: 3500,
            paid: false,
          },
        ],
      },
      {
        id: "12",
        title: "Grab",
        start: "2025-09-22T19:00:00",
        teamId: String(id),
        total: 120000,
        categoryId: "4",
        note: "Đi Grab về nhà",
        participants: [
          {
            id: "m23",
            name: "Tuấn",
            email: "tuan@example.com",
            amount: 60000,
            paid: true,
            paidAt: "2025-09-22T19:20:00",
          },
          {
            id: "m24",
            name: "Hà",
            email: "ha@example.com",
            amount: 60000,
            paid: false,
          },
        ],
      },
      {
        id: "13",
        title: "Taxi",
        start: "2025-09-23T23:00:00",
        teamId: String(id),
        total: 200000,
        categoryId: "4",
        note: "Đi taxi khuya",
        participants: [
          {
            id: "m25",
            name: "Nam",
            email: "nam@example.com",
            amount: 100000,
            paid: true,
            paidAt: "2025-09-23T23:30:00",
          },
          {
            id: "m26",
            name: "Chi",
            email: "chi@example.com",
            amount: 100000,
            paid: false,
          },
        ],
      },
      {
        id: "14",
        title: "Xem phim",
        start: "2025-09-22T20:00:00",
        teamId: String(id),
        total: 120000,
        categoryId: "5",
        note: "CGV Vincom",
        participants: [
          {
            id: "m27",
            name: "Hùng",
            email: "hung@example.com",
            amount: 60000,
            paid: true,
            paidAt: "2025-09-22T20:10:00",
          },
          {
            id: "m28",
            name: "Lan",
            email: "lan@example.com",
            amount: 60000,
            paid: false,
          },
        ],
      },
      {
        id: "15",
        title: "Karaoke",
        start: "2025-09-23T21:00:00",
        teamId: String(id),
        total: 400000,
        categoryId: "5",
        note: "Đi hát với bạn bè",
        participants: [
          {
            id: "m29",
            name: "Tuấn",
            email: "tuan@example.com",
            amount: 200000,
            paid: true,
            paidAt: "2025-09-23T21:40:00",
          },
          {
            id: "m30",
            name: "Phong",
            email: "phong@example.com",
            amount: 200000,
            paid: false,
          },
        ],
      },
      {
        id: "16",
        title: "Chơi game",
        start: "2025-09-24T15:00:00",
        teamId: String(id),
        total: 80000,
        categoryId: "5",
        note: "Nạp game",
        participants: [
          {
            id: "m31",
            name: "Hà",
            email: "ha@example.com",
            amount: 40000,
            paid: true,
            paidAt: "2025-09-24T15:20:00",
          },
          {
            id: "m32",
            name: "Nam",
            email: "nam@example.com",
            amount: 40000,
            paid: false,
          },
        ],
      },
      {
        id: "17",
        title: "Quà sinh nhật",
        start: "2025-09-23T19:00:00",
        teamId: String(id),
        total: 300000,
        categoryId: "6",
        note: "Mua quà cho bạn",
        participants: [
          {
            id: "m33",
            name: "Tuấn",
            email: "tuan@example.com",
            amount: 150000,
            paid: true,
            paidAt: "2025-09-23T19:30:00",
          },
          {
            id: "m34",
            name: "Chi",
            email: "chi@example.com",
            amount: 150000,
            paid: false,
          },
        ],
      },
      {
        id: "18",
        title: "Ủng hộ từ thiện",
        start: "2025-09-24T10:00:00",
        teamId: String(id),
        total: 200000,
        categoryId: "6",
        note: "Ủng hộ vùng lũ",
        participants: [
          {
            id: "m35",
            name: "Lan",
            email: "lan@example.com",
            amount: 100000,
            paid: true,
            paidAt: "2025-09-24T10:15:00",
          },
          {
            id: "m36",
            name: "Phong",
            email: "phong@example.com",
            amount: 100000,
            paid: false,
          },
        ],
      },
      {
        id: "19",
        title: "Mua cây cảnh",
        start: "2025-09-24T18:00:00",
        teamId: String(id),
        total: 180000,
        categoryId: "6",
        note: "Cây để bàn",
        participants: [
          {
            id: "m37",
            name: "Hùng",
            email: "hung@example.com",
            amount: 90000,
            paid: true,
            paidAt: "2025-09-24T18:30:00",
          },
          {
            id: "m38",
            name: "Lan",
            email: "lan@example.com",
            amount: 90000,
            paid: false,
          },
        ],
      },
      {
        id: "20",
        title: "Đóng tiền điện",
        start: "2025-09-25T09:00:00",
        teamId: String(id),
        total: 500000,
        categoryId: "6",
        note: "Hóa đơn tháng 9",
        participants: [
          {
            id: "m39",
            name: "Phong",
            email: "phong@example.com",
            amount: 250000,
            paid: true,
            paidAt: "2025-09-25T10:00:00",
          },
          {
            id: "m40",
            name: "Chi",
            email: "chi@example.com",
            amount: 250000,
            paid: false,
          },
        ],
      },
    ];

    const found = fakeEvents.find(
      (ev) => ev.id === eventId && ev.teamId === id
    );
    if (found) {
      setEvent(found);
    } else {
      message.error("Không tìm thấy sự kiện");
      router.push(`/split/${id}`);
    }
    setLoading(false);
  }, [id, eventId, router]);

  if (loading) return <Spin fullscreen />;
  if (!event) return null;

  const category = categories.find((c) => c.id === event.categoryId);

  // ================== Table Columns ==================
  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `${val.toLocaleString()} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "paid",
      key: "paid",
      render: (_: boolean, record: Participant) =>
        record.paid ? (
          <Tag color="green" className="px-3 py-1 text-white rounded-md">
            Đã thanh toán
          </Tag>
        ) : (
          <Tag color="red" className="px-3 py-1 text-white rounded-md">
            Chưa thanh toán
          </Tag>
        ),
    },

    {
      title: "Thời gian thanh toán",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (val?: string) =>
        val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-",
    },
  ];

  return (
    <div className="p-1 mx-auto">
      <Card>
        {/* Nút quay lại bên trái */}
        <div className="mb-4">
          <Button
            onClick={() => router.push(`/split/${id}`)}
            icon={<ArrowLeftOutlined />}
            className="bg-sky-300 text-white hover:bg-sky-400 flex items-center"
          >
            Quay lại
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Tên sự kiện </p>
              <p className="text-lg font-semibold">
                {event.title} |{" "}
                <Tag color={category?.color || "default"}>
                  {category?.name || "Chung"}
                </Tag>
              </p>
            </div>
            <div>
              <p className="text-gray-500">Tổng số tiền</p>
              <p className="text-lg font-medium text-red-600">
                {event.total.toLocaleString()} ₫
              </p>
            </div>
          </div>

          {/* Người trả + Ngày giờ trên cùng một hàng và căn giữa */}
          <div className="flex justify-start items-center gap-20">
            <div>
              <p className="text-gray-500">Người trả</p>
              <p>
                {event.participants
                  ?.filter((p) => p.paid)
                  .map((p) => p.name)
                  .join(", ") || "Chưa có ai trả"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Ngày giờ</p>
              <p>{dayjs(event.start).format("DD/MM/YYYY HH:mm")}</p>
            </div>
          </div>

          {event.note && (
            <div>
              <p className="text-gray-700">Ghi chú</p>
              <p>{event.note}</p>
            </div>
          )}
        </div>

        {/* Danh sách người tham gia */}
        <h3 className="text-lg font-semibold mb-2">Người tham gia</h3>
        <Table
          rowKey="id"
          dataSource={event.participants || []}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  );
}

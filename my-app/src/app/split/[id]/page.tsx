// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Spin,
//   message,
//   List,
//   DatePicker,
//   Select,
//   Space,
//   Button,
//   Modal,
//   Form,
//   Input,
//   InputNumber,
//   Tag,
//   ConfigProvider,
//   Card,
// } from "antd";
// import viVN from "antd/es/locale/vi_VN";
// import dayjs, { Dayjs } from "dayjs";
// import isBetween from "dayjs/plugin/isBetween";
// import "dayjs/locale/vi";
// import {
//   DeleteOutlined,
//   EditOutlined,
//   EyeOutlined,
//   PlusOutlined,
// } from "@ant-design/icons";

// import { useSplitsByTeam } from "@/lib/hook/useSplit";
// import SplitBillForm from "@/components/Modals/SplitBillModal";
// import { ROUTER_PATH } from "@/app/routerPath";

// dayjs.locale("vi");
// dayjs.extend(isBetween);
// const { RangePicker } = DatePicker;

// /* =====================================================
//    TYPES
// ===================================================== */

// export type Category = {
//   id: string;
//   name: string;
//   color: string;
// };

// export type CalendarEvent = {
//   id: string;
//   title: string;
//   start: string;
//   teamId: string;
//   total: number;
//   categoryId: string;
//   categoryName?: string;
//   categoryColor?: string;
//   note?: string;
// };

// /* API Split từ backend */
// // type ISplitApi = {
// //   _id: string;
// //   total: number;
// //   note?: string;
// //   date?: string;
// //   expenseId?: {
// //     title?: string;
// //     date?: string;
// //     amount?: number;
// //   } | null;
// //   categoryId?: {
// //     _id: string;
// //     name: string;
// //     color: string;
// //   } | null;
// // };

// /* =====================================================
//    EXPENSE MODAL
// ===================================================== */

// type ExpenseModalProps = {
//   open: boolean;
//   event: CalendarEvent | null;
//   categories: Category[];
//   onClose: () => void;
//   onSave: (event: CalendarEvent) => void;
// };

// function ExpenseModal({
//   open,
//   event,
//   categories,
//   onClose,
//   onSave,
// }: ExpenseModalProps) {
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (event) {
//       form.setFieldsValue({
//         ...event,
//         start: dayjs(event.start),
//       });
//     } else {
//       form.resetFields();
//     }
//   }, [event, form]);

//   const handleOk = () => {
//     form.validateFields().then((values) => {
//       const newEvent: CalendarEvent = {
//         id: event ? event.id : String(Date.now()),
//         title: values.title,
//         start: values.start.toISOString(),
//         total: values.total,
//         categoryId: values.categoryId,
//         categoryName: categories.find((c) => c.id === values.categoryId)?.name,
//         categoryColor: categories.find((c) => c.id === values.categoryId)
//           ?.color,
//         note: values.note,
//         teamId: event ? event.teamId : "temp",
//       };

//       onSave(newEvent);
//     });
//   };

//   return (
//     <Modal
//       title={event ? "Sửa chi tiêu" : "Thêm chi tiêu"}
//       open={open}
//       onCancel={onClose}
//       onOk={handleOk}
//       okText="Lưu"
//       cancelText="Hủy"
//     >
//       <Form form={form} layout="vertical">
//         <Form.Item
//           label="Tên chi tiêu"
//           name="title"
//           rules={[{ required: true, message: "Nhập tên chi tiêu" }]}
//         >
//           <Input placeholder="Ví dụ: Cơm trưa" />
//         </Form.Item>

//         <Form.Item
//           label="Ngày giờ"
//           name="start"
//           rules={[{ required: true, message: "Chọn ngày giờ" }]}
//         >
//           <DatePicker
//             showTime
//             style={{ width: "100%" }}
//             format="DD/MM/YYYY HH:mm"
//           />
//         </Form.Item>

//         <Form.Item
//           label="Số tiền (VNĐ)"
//           name="total"
//           rules={[{ required: true, message: "Nhập số tiền" }]}
//         >
//           <InputNumber
//             style={{ width: "100%" }}
//             min={0}
//             step={1000}
//             placeholder="Nhập số tiền"
//           />
//         </Form.Item>

//         <Form.Item
//           label="Danh mục"
//           name="categoryId"
//           rules={[{ required: true, message: "Chọn danh mục" }]}
//         >
//           <Select
//             options={categories.map((c) => ({
//               value: c.id,
//               label: c.name,
//             }))}
//             placeholder="Chọn danh mục"
//           />
//         </Form.Item>

//         <Form.Item label="Ghi chú" name="note">
//           <Input.TextArea placeholder="Thêm ghi chú" rows={3} />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// }

// /* =====================================================
//    MAIN PAGE
// ===================================================== */

// export default function SplitPage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();
//   const { data: teamSplits = [], isLoading: splitLoading } =
//     useSplitsByTeam(id);

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
//   const [loading] = useState(false);

//   const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
//   const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
//     null,
//     null,
//   ]);
//   const [filterCategory, setFilterCategory] = useState<string>("all");

//   /* =====================================================
//      LOAD CATEGORY
//   ===================================================== */
//   useEffect(() => {
//     const uid = localStorage.getItem("userId");
//     if (!uid) return;

//     fetch(`http://localhost:8080/api/categories?userId=${uid}`)
//       .then((res) => res.json())
//       .then((data) =>
//         setCategories(
//           data.map((c: any) => ({
//             id: c._id,
//             name: c.name,
//             color: c.color,
//           }))
//         )
//       );
//   }, []);

//   /* =====================================================
//      FILTER EVENTS
//   ===================================================== */
//   useEffect(() => {
//     let filtered = [...events];

//     if (range[0] && range[1]) {
//       filtered = filtered.filter((e) =>
//         dayjs(e.start).isBetween(range[0], range[1], "day", "[]")
//       );
//     }

//     if (filterCategory !== "all") {
//       filtered = filtered.filter((e) => e.categoryId === filterCategory);
//     }

//     setFilteredEvents(filtered);
//   }, [range, filterCategory, events]);

//   /* =====================================================
//      MAP SPLIT API → UI EVENT
//   ===================================================== */
//   useEffect(() => {
//     if (!teamSplits) return;

//     const mapped = teamSplits.map((sp) => {
//       const item = sp as ISplit;
//       return {
//         id: item._id,
//         title: item.expenseId?.title ?? "Không tên",
//         start: item.date ?? item.expenseId?.date ?? new Date().toISOString(),
//         teamId: id ?? "",
//         total: item.total ?? item.expenseId?.amount ?? 0,

//         categoryId: item.categoryId?._id ?? "deleted",
//         categoryName: item.categoryId?.name ?? "Danh mục đã xoá",
//         categoryColor: item.categoryId?.color ?? "default",

//         note: item.note ?? "",
//       };
//     });

//     setEvents(mapped);
//   }, [teamSplits, id]);

//   /* =====================================================
//      SAVE EVENT
//   ===================================================== */
//   const handleSaveEvent = (newEvent: CalendarEvent) => {
//     let updated: CalendarEvent[];

//     if (editingEvent) {
//       updated = events.map((e) => (e.id === newEvent.id ? newEvent : e));
//       message.success("Cập nhật thành công!");
//     } else {
//       updated = [...events, newEvent];
//       message.success("Thêm chi tiêu thành công!");
//     }

//     setEvents(updated);
//     setIsSplitModalOpen(false);
//     setEditingEvent(null);
//   };

//   /* =====================================================
//      UI
//   ===================================================== */
//   return (
//     <ConfigProvider locale={viVN}>
//       <div className="min-h-screen font-sans text-gray-800 p-4 rounded-lg">
//         <h1 className="text-2xl font-bold mb-2 text-gray-800">
//           Quản lý chi tiêu
//         </h1>
//         <p className="text-gray-500 mb-5">
//           Theo dõi và quản lý toàn bộ chi tiêu trong nhóm
//         </p>

//         <Spin spinning={loading || splitLoading}>
//           <div className="flex gap-6 items-start">
//             {/* Sidebar */}
//             <div className="w-[320px] sticky top-4 self-start">
//               <Card
//                 size="small"
//                 title={<span className="font-semibold">Chia hoá đơn</span>}
//                 className="bg-white rounded-xl shadow-md"
//               >
//                 <SplitBillForm
//                   selectedDate={dayjs()}
//                   teamId={id}
//                   onSaved={(ev) => {
//                     setEvents((prev) => [...prev, ev]);
//                     message.success("Đã thêm chi tiêu!");
//                   }}
//                 />
//               </Card>
//             </div>

//             {/* Main */}
//             <div className="flex-1">
//               <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center border border-gray-100">
//                 <h2 className="text-lg font-semibold text-gray-700">
//                   Danh sách chi tiêu
//                 </h2>

//                 <Space wrap>
//                   <RangePicker
//                     format="DD/MM/YYYY"
//                     value={range}
//                     onChange={(val) =>
//                       setRange(val as [Dayjs | null, Dayjs | null])
//                     }
//                   />

//                   <Select
//                     value={filterCategory}
//                     onChange={(val) => setFilterCategory(val)}
//                     style={{ width: 150 }}
//                   >
//                     <Select.Option value="all">Tất cả</Select.Option>

//                     {categories.map((c) => (
//                       <Select.Option key={c.id} value={c.id}>
//                         {c.name}
//                       </Select.Option>
//                     ))}
//                   </Select>

//                   <Button
//                     type="primary"
//                     icon={<PlusOutlined />}
//                     className="rounded-full bg-blue-500 hover:bg-blue-600 border-none px-5 py-2 font-medium shadow text-white"
//                     onClick={() => {
//                       setEditingEvent(null);
//                       setIsSplitModalOpen(true);
//                     }}
//                   >
//                     Thêm chi tiêu
//                   </Button>
//                 </Space>
//               </div>

//               {/* List */}
//               <div className="space-y-4 max-h-[100vh] overflow-y-auto shadow-lg">
//                 {Object.entries(
//                   filteredEvents.reduce((acc, ev) => {
//                     const day = dayjs(ev.start).format("YYYY-MM-DD");
//                     if (!acc[day]) acc[day] = [];
//                     acc[day].push(ev);
//                     return acc;
//                   }, {} as Record<string, CalendarEvent[]>)
//                 ).map(([day, dayEvents]) => {
//                   const totalDay = dayEvents.reduce(
//                     (sum, ev) => sum + (ev.total || 0),
//                     0
//                   );

//                   return (
//                     <div
//                       key={day}
//                       className="bg-white rounded-lg shadow-sm p-4"
//                     >
//                       <div className="flex justify-between items-center mb-3">
//                         <h3 className="font-semibold text-base text-gray-700">
//                           {dayjs(day).format("dddd, DD/MM/YYYY")}
//                         </h3>
//                         <span className="text-sm text-gray-500">
//                           Tổng: {totalDay.toLocaleString()} VNĐ
//                         </span>
//                       </div>

//                       <List
//                         bordered={false}
//                         dataSource={dayEvents}
//                         renderItem={(ev) => {
//                           const cat = categories.find(
//                             (c) => c.id === ev.categoryId
//                           );

//                           return (
//                             <List.Item
//                               className="px-0"
//                               actions={[
//                                 <EyeOutlined
//                                   key="view"
//                                   style={{ color: "#1677ff" }}
//                                   onClick={() => {
//                                     router.push(
//                                       ROUTER_PATH.SPLIT.SU_KIEN?.(id, ev.id) ??
//                                         `/split/${id}/event/${ev.id}`
//                                     );
//                                   }}
//                                 />,
//                                 <EditOutlined
//                                   key="edit"
//                                   style={{ color: "#000" }}
//                                   onClick={() => {
//                                     setEditingEvent(ev);
//                                     setIsSplitModalOpen(true);
//                                   }}
//                                 />,
//                                 <DeleteOutlined
//                                   key="delete"
//                                   style={{ color: "#ff4d4f" }}
//                                   onClick={() => {
//                                     setEvents((prev) =>
//                                       prev.filter((e) => e.id !== ev.id)
//                                     );
//                                     message.success("Đã xoá sự kiện");
//                                   }}
//                                 />,
//                               ]}
//                             >
//                               <div className="flex justify-between w-full">
//                                 <div className="flex items-center gap-2">
//                                   <Tag
//                                     color={cat?.color || "default"}
//                                     className="min-w-[80px] text-center"
//                                   >
//                                     {cat?.name || "Danh mục đã xoá"}
//                                   </Tag>

//                                   {ev.note && (
//                                     <span className="text-gray-500 text-sm">
//                                       | {ev.note}
//                                     </span>
//                                   )}
//                                 </div>

//                                 <span className="text-gray-600 font-medium min-w-[100px] text-right">
//                                   {ev.total?.toLocaleString()} VNĐ
//                                 </span>
//                               </div>
//                             </List.Item>
//                           );
//                         }}
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </Spin>

//         <ExpenseModal
//           open={isSplitModalOpen}
//           event={editingEvent}
//           categories={categories}
//           onClose={() => {
//             setIsSplitModalOpen(false);
//             setEditingEvent(null);
//           }}
//           onSave={handleSaveEvent}
//         />
//       </div>
//     </ConfigProvider>
//   );
// }

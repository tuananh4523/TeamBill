"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  Input,
  Button,
  Space,
  Tag,
  Segmented,
  message,
  Select,
  Divider,
  DatePicker,
  Tooltip,
  ConfigProvider,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useAuth } from "@/context/AuthContext";
import { useGetCategories } from "@/hooks/api/useCategories/useCategories";
import {
  useCreateExpense,
  useGetExpensesByTeam,
} from "@/hooks/api/useExpense/useExpense";
import { useCreateSplit } from "@/hooks/api/useSplits/useSplits";
import { useGetMembersByTeam } from "@/hooks/api/useMembers/useMembers";
import { useGetTeamsQuery } from "@/hooks/api/useTeam/useTeams";
import { apiClient } from "@/lib/apiClient";
import type { CreateExpensePayload, Expense, Split, Member } from "@/types";

dayjs.locale("vi");

type SplitType = "equally" | "unequally";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  total?: number;
  categoryId?: string;
  note?: string;
  teamId?: string;
};

type SplitBillFormProps = {
  selectedDate?: Dayjs;
  onSaved?: (event: CalendarEvent) => void;
  teamId: string;
};

type SplitBillFormValues = {
  amount: number;
  participantName?: string;
  paidBy?: string;
  date?: Dayjs;
  categoryId?: string;
  note?: string;
};

export default function SplitBillForm({
  selectedDate,
  teamId,
  onSaved,
}: SplitBillFormProps) {
  const [form] = Form.useForm<SplitBillFormValues>();
  const [participants, setParticipants] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<SplitType>("equally");
  const [showAll, setShowAll] = useState(false);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>(
    {},
  );
  const [result, setResult] = useState<
    { from: string; to: string; amount: number }[]
  >([]);

  const { user } = useAuth();

  const { data: userTeams = [] } = useGetTeamsQuery();
  const { data: defaultMembers = [] } = useGetMembersByTeam(teamId);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useGetCategories(user?.id || "");

  const expenseCreate = useCreateExpense();
  const splitCreate = useCreateSplit();

  // ----- Thêm 1 thành viên -----
  const addParticipant = (name?: string) => {
    if (!name) return message.error("Vui lòng nhập tên");
    if (participants.includes(name))
      return message.warning("Thành viên đã tồn tại");

    setParticipants((prev) => [...prev, name]);
    form.setFieldValue("participantName", "");
  };
  useEffect(() => {
    if (defaultMembers.length > 0 && participants.length === 0) {
      setParticipants(defaultMembers.map((m: Member) => m.name));
    }
  }, [defaultMembers, participants.length]);

  // ----- Thêm nhóm -----
  const addGroups = async (teamIds: string[]) => {
    const collectedNames: string[] = [];

    for (const id of teamIds) {
      const members = (await queryClient.fetchQuery({
        queryKey: ["teamMembers", id],
        queryFn: async () =>
          apiClient<Member[]>(`/members/team/${id}`),
      })) as Member[];

      collectedNames.push(...members.map((m) => m.name));
    }

    const unique = collectedNames.filter(
      (name) => !participants.includes(name),
    );

    if (!unique.length) {
      message.info("Nhóm này đã có đầy đủ thành viên");
      return;
    }

    setParticipants((prev) => [...prev, ...unique]);
  };

  // ----- Xóa người tham gia -----
  const removeParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
    const clone = { ...customAmounts };
    delete clone[name];
    setCustomAmounts(clone);
  };

  // ----- Tính toán chia tiền -----
  const handleCalculate = async () => {
    try {
      const values = await form.validateFields();
      if (participants.length < 2)
        return message.error("Cần ít nhất 2 người tham gia");

      const amount = Number(values.amount);
      if (!amount || amount <= 0) return message.error("Số tiền không hợp lệ");

      const paidBy = values.paidBy!;
      const balances: Record<string, number> = {};

      participants.forEach((p) => (balances[p] = 0));

      if (splitType === "equally") {
        const per = amount / participants.length;
        participants.forEach((p) => (balances[p] = -per));
        balances[paidBy] = amount - per;
      } else {
        const totalCustom = Object.values(customAmounts).reduce(
          (a, b) => a + b,
          0
        );
        if (totalCustom !== amount)
          return message.error("Tổng số tiền không khớp");

        participants.forEach((p) => {
          balances[p] = -(customAmounts[p] || 0);
        });
        balances[paidBy] += amount;
      }

      const creditors = Object.entries(balances)
        .filter(([, v]) => v > 0)
        .map(([name, amount]) => ({ name, amount }));

      const debtors = Object.entries(balances)
        .filter(([, v]) => v < 0)
        .map(([name, amount]) => ({ name, amount: -amount }));

      const tx: { from: string; to: string; amount: number }[] = [];
      let i = 0,
        j = 0;

      while (i < debtors.length && j < creditors.length) {
        const d = debtors[i];
        const c = creditors[j];
        const pay = Math.min(d.amount, c.amount);

        tx.push({ from: d.name, to: c.name, amount: pay });

        d.amount -= pay;
        c.amount -= pay;

        if (d.amount === 0) i++;
        if (c.amount === 0) j++;
      }

      setResult(tx);
    } catch {}
  };

  // ----- Lưu vào DB -----
  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();

      if (!user?.id) return message.error("Bạn chưa đăng nhập");
      if (!teamId) return message.error("Không tìm thấy team");

      if (!values.date) return message.error("Chọn ngày");
      if (!values.amount) return message.error("Nhập số tiền");
      if (!values.categoryId) return message.error("Chọn danh mục");
      if (!result.length) return message.error("Hãy bấm tính toán trước");

      const payload: CreateExpensePayload = {
        teamId,
        createdBy: user.id,
        title: values.note || "Chi tiêu mới",
        amount: Number(values.amount),
        category: values.categoryId!,
        description: values.note,
        status: "completed",
        splitMethod: splitType === "equally" ? "equal" : "custom",
        date: values.date.toISOString(),
      } as CreateExpensePayload;

      const expense = (await expenseCreate.mutateAsync(
        payload,
      )) as Expense;
      const expenseId: string = String(expense._id);

      const splitPayload: Partial<Split> = {
        expenseId,
        teamId,
        total: expense.amount,
        method: splitType === "equally" ? "equal" : "custom",
        currency: "VND",
        date: expense.date,
      };

      await splitCreate.mutateAsync(splitPayload);

      onSaved?.({
        id: String(expenseId),
        title: expense.title,
        start: String(expense.date ?? new Date().toISOString()),
        total: expense.amount,
        categoryId: expense.category,
        note: expense.description,
        teamId,
      });

      message.success("Lưu thành công!");
      form.resetFields();
      setParticipants([]);
      setCustomAmounts({});
      setResult([]);
    } catch {}
  };

  const isSaving = expenseCreate.isPending || splitCreate.isPending;

  return (
    <ConfigProvider locale={viVN}>
      <Form
        layout="vertical"
        form={form}
        initialValues={{ date: selectedDate }}
      >
        {/* Ngày sự kiện */}
        <Form.Item
          name="date"
          label="Ngày sự kiện"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Số tiền */}
        <Form.Item
          name="amount"
          label="Tổng số tiền (VNĐ)"
          rules={[{ required: true }]}
        >
          <Input type="number" placeholder="Nhập số tiền" />
        </Form.Item>

        {/* Danh mục */}
        <Form.Item
          name="categoryId"
          label="Danh mục chi tiêu"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((c) => (
              <Select.Option key={c._id} value={c._id}>
                <span className="flex items-center gap-2">
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c.color,
                      display: "inline-block",
                    }}
                  />
                  {c.name}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ghi chú */}
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>

        {/* Người tham gia */}
        <Form.Item label="Người tham gia (tối thiểu 2)">
          <Space.Compact className="mb-2" style={{ width: "100%" }}>
            <Form.Item name="participantName" noStyle>
              <Input placeholder="Tên thành viên" />
            </Form.Item>
            <Button
              type="primary"
              onClick={() =>
                addParticipant(form.getFieldValue("participantName"))
              }
            >
              Thêm
            </Button>
          </Space.Compact>

          <Select
            mode="multiple"
            placeholder="Chọn nhóm để thêm"
            onChange={addGroups}
            style={{ width: "100%" }}
          >
            {userTeams.map((t) => (
              <Select.Option key={t._id} value={t._id}>
                {t.name}
              </Select.Option>
            ))}
          </Select>

          <div className="mt-3">
            {(showAll ? participants : participants.slice(0, 5)).map((p) => (
              <div
                key={p}
                className="flex justify-between border-b py-2 items-center"
              >
                <span>{p}</span>
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeParticipant(p)}
                  />
                </Tooltip>
              </div>
            ))}

            {participants.length > 5 && (
              <Button
                type="link"
                size="small"
                className="mt-2"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Thu gọn" : `Xem thêm (${participants.length - 5})`}
              </Button>
            )}
          </div>
        </Form.Item>

        {/* Người trả */}
        <Form.Item name="paidBy" label="Người trả" rules={[{ required: true }]}>
          <Select placeholder="Chọn người trả">
            {participants.map((p) => (
              <Select.Option key={p} value={p}>
                {p}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Cách chia */}
        <Form.Item label="Cách chia" required>
          <Segmented
            block
            options={[
              { label: "Chia đều", value: "equally" },
              { label: "Chia không đều", value: "unequally" },
            ]}
            value={splitType}
            onChange={(v) => setSplitType(v as SplitType)}
          />
        </Form.Item>

        {/* Tùy chỉnh */}
        {splitType === "unequally" && (
          <div className="p-3 bg-gray-50 border rounded">
            {participants.map((p) => (
              <Form.Item key={p} label={p}>
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmounts[p] || 0}
                  onChange={(e) =>
                    setCustomAmounts({
                      ...customAmounts,
                      [p]: Number(e.target.value),
                    })
                  }
                />
              </Form.Item>
            ))}
          </div>
        )}

        <Divider />

        {/* Tính toán */}
        <Button type="primary" block onClick={handleCalculate}>
          Tính toán
        </Button>

        {/* Kết quả */}
        {result.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Kết quả:</h4>

            {result.map((r, i) => (
              <p key={i}>
                {r.from} → {r.to}:{" "}
                <Tag color="green">{r.amount.toLocaleString("vi-VN")} VNĐ</Tag>
              </p>
            ))}

            <Button
              type="primary"
              block
              className="mt-3"
              loading={isSaving}
              onClick={handleSave}
            >
              Lưu
            </Button>
          </div>
        )}
      </Form>
    </ConfigProvider>
  );
}

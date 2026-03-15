"use client";

import { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tooltip,
  Space,
  Table,
  Empty,
  Spin,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  useGetWalletsQuery,
  useGetTransactionsByWallet,
  useGetTeamsQuery,
} from "@/hooks/api";
import type { Wallet, Transaction } from "@/types";

const { Title, Text } = Typography;

function usePrimaryWallet(wallets: Wallet[] | undefined, userId: string | undefined) {
  return useMemo(() => {
    if (!wallets?.length) return undefined;
    if (userId) {
      const mine = wallets.find((w) => String(w.userId) === String(userId));
      if (mine) return mine;
    }
    return wallets[0];
  }, [wallets, userId]);
}

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: wallets = [], isLoading: loadingWallets } = useGetWalletsQuery();
  const primaryWallet = usePrimaryWallet(wallets, user?.id);
  const walletId = primaryWallet?._id ?? "";

  const { data: transactions = [], isLoading: loadingTransactions } =
    useGetTransactionsByWallet(walletId);
  const { data: teams = [], isLoading: loadingTeams } = useGetTeamsQuery();

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => (t as Transaction & { direction?: string }).direction === "out")
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [transactions]
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["wallets"] });
    queryClient.invalidateQueries({ queryKey: ["teams"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const loading = loadingWallets || loadingTeams || (!!walletId && loadingTransactions);

  return (
    <div className="min-h-screen p-6">
      <Row justify="space-between" align="middle" className="mb-5">
        <Title level={3} className="!ml-1">
          Bảng điều khiển
        </Title>
        <Space>
          <Tooltip title="Làm mới">
            <Button shape="circle" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} />
          </Tooltip>
          <Tooltip title="Cài đặt">
            <Button shape="circle" icon={<SettingOutlined />} />
          </Tooltip>
        </Space>
      </Row>

      {loading && !primaryWallet ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              className="rounded-2xl border-0 shadow-sm text-white"
              style={{ background: "linear-gradient(90deg,#2F80ED 0%,#56CCF2 100%)" }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text className="text-sm text-white/90">Số dư ví</Text>
                  <Title level={3} style={{ color: "white", margin: 0 }}>
                    {primaryWallet
                      ? showBalance
                        ? `${Number(primaryWallet.balance ?? 0).toLocaleString()} ₫`
                        : "*** ₫"
                      : "— ₫"}
                  </Title>
                  <Text className="text-white/80 text-xs">
                    {primaryWallet
                      ? `${primaryWallet.bankAccount_holderName || "—"} • ${primaryWallet.refCode || "—"}`
                      : "Chưa có ví"}
                  </Text>
                </Col>
                <Col>
                  <Tooltip title={showBalance ? "Ẩn số dư" : "Hiện số dư"}>
                    <Button
                      shape="circle"
                      icon={showBalance ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={() => setShowBalance(!showBalance)}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-sm text-center" title="Giao dịch">
              <Title level={3}>{transactions.length}</Title>
              <Text type="secondary">Giao dịch đã thực hiện</Text>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-sm text-center" title="Tổng chi tiêu">
              <Title level={3}>{totalExpenses.toLocaleString()} ₫</Title>
              <Text type="secondary">Chi tiêu đã ghi nhận</Text>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-sm text-center" title="Nhóm tham gia">
              <Title level={3}>{teams.length}</Title>
              <Text type="secondary">Nhóm của bạn</Text>
            </Card>
          </Col>

          <Col xs={24}>
            <Card
              className="rounded-2xl shadow-sm"
              title="Giao dịch gần đây"
              extra={
                <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loadingTransactions} />
              }
            >
              {loadingTransactions && !transactions.length ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : !transactions.length ? (
                <Empty description="Không có giao dịch" />
              ) : (
                <Table
                  dataSource={transactions}
                  pagination={false}
                  rowKey="_id"
                  loading={loadingTransactions}
                >
                  <Table.Column title="Mã GD" dataIndex="code" render={(c: string) => <Text code>{c ?? "—"}</Text>} />
                  <Table.Column
                    title="Loại"
                    dataIndex="type"
                    render={(type: string, record: Transaction & { direction?: string }) => (
                      <Text type={record.direction === "in" ? "success" : "danger"}>
                        {(type ?? "").toUpperCase()}
                      </Text>
                    )}
                  />
                  <Table.Column
                    title="Số tiền"
                    dataIndex="amount"
                    render={(a: number) => (a != null ? `${Number(a).toLocaleString()} ₫` : "—")}
                  />
                  <Table.Column title="Mô tả" dataIndex="description" render={(d?: string) => d || "—"} />
                </Table>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

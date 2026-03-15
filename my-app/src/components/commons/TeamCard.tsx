"use client"

import { Card, Avatar, Button, Space, Tag } from "antd"
import { SettingOutlined, TeamOutlined } from "@ant-design/icons"
import { Team } from "@/types"
import { useGetMembersByTeam } from "@/hooks/api"
import TeamAvatarStack from "./TeamAvatarStack"

interface Props {
  team: Team
  onClick: () => void
}

export default function TeamCard({ team, onClick }: Props) {
  const { data: members = [] } = useGetMembersByTeam(team._id)

  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        borderRadius: 24,
        background: "linear-gradient(135deg,#FAD0C4,#FFD1FF)",
        border: "none",
      }}
      bodyStyle={{
        padding: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Space size={16}>
        <Avatar
          size={44}
          icon={<TeamOutlined />}
        />

        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {team.name}
          </div>

          <Tag color="green" style={{ marginTop: 4 }}>
            Active
          </Tag>

          <TeamAvatarStack members={members} />
        </div>
      </Space>

      <Button
        shape="circle"
        icon={<SettingOutlined />}
        onClick={(e) => {
          e.stopPropagation()
        }}
      />
    </Card>
  )
}
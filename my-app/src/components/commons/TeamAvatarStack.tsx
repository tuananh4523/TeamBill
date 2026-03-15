import { Avatar } from "antd"
import { Member } from "@/types"

interface Props {
  members: Member[]
}

export default function TeamAvatarStack({ members }: Props) {
  const visible = members.slice(0, 4)
  const extra = members.length - 4

  return (
    <Avatar.Group
      size={32}
      maxCount={4}
      style={{ marginTop: 8 }}
    >
      {visible.map((m) => (
        <Avatar
          key={m._id}
          src={m.avatar || `https://i.pravatar.cc/40?u=${m._id}`}
        />
      ))}

      {extra > 0 && <Avatar>+{extra}</Avatar>}
    </Avatar.Group>
  )
}
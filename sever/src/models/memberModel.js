import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    status: { type: String, enum: ["active", "inactive", "left"], default: "active" },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    contribution: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "members",
    versionKey: false,
  }
);

const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);
export default Member;

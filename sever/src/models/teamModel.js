import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
    refCode: { type: String, unique: true, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    membersCount: { type: Number, default: 0 },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    privacy: {
      type: String,
      enum: ["public", "private", "invite-only"],
      default: "private",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    totalExpense: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    versionKey: false,
    collection: "teams",
  }
);

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
export default Team;

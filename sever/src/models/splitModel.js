import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    total: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["equal", "percentage", "custom"],
      default: "equal",
    },
    currency: { type: String, trim: true, default: "VND" },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "splits",
    versionKey: false,
  }
);

const Split = mongoose.models.Split || mongoose.model("Split", splitSchema);
export default Split;

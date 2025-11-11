import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    splitMethod: {
      type: String,
      enum: ["equal", "percentage", "custom"],
      default: "equal",
    },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    versionKey: false,
    collection: "expenses",
  }
);

const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
export default Expense;

// models/splitModel.js
import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  paid: { type: Number, required: true, min: 0 },
});

const splitSchema = new mongoose.Schema(
  {
    members: { type: [memberSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Split", splitSchema);

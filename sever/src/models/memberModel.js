// // models/memberModel.js
// import mongoose from "mongoose";

// const memberSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   age: {
//     type: Number,
//     default: null,
//   },
//   teamId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Team", // liên kết với bảng Team
//   },
// }, { timestamps: true });

// const Member = mongoose.model("Member", memberSchema);

// export default Member;
import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
});

const Member = mongoose.model("Member", memberSchema);
export default Member;


// import mongoose from "mongoose";

// const memberSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   role: { type: String, trim: true },
//   email: { type: String, trim: true },
//   status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
// });

// const teamSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     members: [memberSchema], // subdocument
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Team", teamSchema);
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
});

const Team = mongoose.model("Team", teamSchema);
export default Team;


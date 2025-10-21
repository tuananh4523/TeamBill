import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  role: { type: String, enum: ["admin", "member"], default: "member" }
});

export default mongoose.model("User", userSchema);

// middleware/authMiddleware.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "teamBill_secret";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // gắn userId vào req.user
    next();
  } catch {
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    fullName: { type: String, trim: true },
    avatar: { type: String, default: '' },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other'
    },
    dateOfBirth: { type: Date },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, default: '' },
    resetToken: { type: String, default: '' },
    resetTokenExpiry: { type: Date },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    address: { type: String, trim: true, default: '' },
    joinedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
    collection: 'users'
  }
)

userSchema.index({ username: 'text', email: 'text', fullName: 'text' })

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User

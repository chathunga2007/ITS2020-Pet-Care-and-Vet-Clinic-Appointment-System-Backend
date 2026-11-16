import { Document, model, Schema } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
  approve: boolean;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
    },
    approve: { type: Boolean, default: true },
    phone: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("users", userSchema);
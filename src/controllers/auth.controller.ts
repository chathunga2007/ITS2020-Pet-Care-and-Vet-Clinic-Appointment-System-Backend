import { Request, Response } from "express";
import { UserModel, UserRole } from "../models/user.model";
import { signAccessToken, signRefreshToken } from "../util/jwt_token";
import { AuthRequest } from "../middleware/auth";
import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// Register User
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roles, phone } = req.body;
    const extUser = await UserModel.findOne({ email });
    if (extUser) {
      return res.status(400).json({
        message: "User already exists..!",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      roles: roles && Array.isArray(roles) && roles.length > 0 ? roles : [UserRole.USER],
      approve: true,
      phone: phone || "",
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully..!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Registration fail",
      error: err,
    });
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required..!",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password..!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password..!",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.status(200).json({
      message: "Login successful..!",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        phone: user.phone,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Login failed..!",
    });
  }
};

// Get My Details
export const getMyDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(req.user.sub).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { email, roles, _id, name, phone } = user;

    return res.status(200).json({
      message: "OK",
      data: { id: _id, name, email, roles, phone },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch user details" });
  }
};

// Admin Only Access
export const adminAccess = async (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    message: "Admin access granted..!",
    data: {
      user: req.user,
    },
  });
};

// Get Refresh Token
export const getRefreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      return res.status(400).json({
        message: "Token required...!",
      });
    }

    const payload: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const userId = payload?.sub;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(403).json({
        message: "Invalid or expired token...!",
      });
    }

    const newAccessToken = signAccessToken(user);

    return res.status(200).json({
      message: "Token refreshed successfully!",
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid or expired token...!" });
  }
};
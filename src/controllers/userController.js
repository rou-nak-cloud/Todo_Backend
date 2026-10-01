import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const existingUser = await userModel.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered..",
      });
    }

    //  hashing password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = await userModel.create({
      userName: userName.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    // token
    const token = await jwt.sign(
      { id: user._id, email: user.email },
      process.env.secretKey,
      {
        expiresIn: "5m",
      },
    );
    user.token = token;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully..",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { registerUser };

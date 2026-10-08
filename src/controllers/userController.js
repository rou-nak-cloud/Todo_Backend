import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();
import { verifyEmail } from "../nodemailer/nodeMailer.js";

const registerUser = async (req, res) => {
  try {
    const { userName, email, password, phone } = req.body;
    const phoneNumber = Number(phone);
    if (!phoneNumber || !userName.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields must be present..",
      });
    }
    if (Number.isNaN(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    const existingUser = await userModel.findOne({
      email: email.trim(),
      phone: phoneNumber,
    });
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
      phone: phoneNumber,
      password: hashedPassword,
      token: "Not verified till now..",
    });

    // token
    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.secretKey,
      {
        expiresIn: "10m",
      },
    );
    user.token = token;

    // Verify email send
    try {
      await verifyEmail(token, email);
      console.log("Email send successfully..");
    } catch (error) {
      console.log("Email can't send.. due to server error..", error);
      return res.send(500).json({
        success: false,
        message: "Failed to send verification mail due to internal error.",
      });
    }

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

const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader.trim() || !authHeader.trim().startsWith("Bearer")) {
      return res.status(400).json({
        success: false,
        message: "Token not found..",
      });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.secretKey, async (err, decoded) => {
      if (err) {
        if (err.message === "TokenExpiredError") {
          return res.status(400).json({
            success: false,
            message: "Token Expired..",
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Token Invalid and Expired..",
          });
        }
      } else {
        const { id, userName } = decoded;
        const user = await userModel.findOne({ _id: id });
        if (!user) {
          return res.status(400).json({
            success: false,
            message: "User not found..",
          });
        }
        user.token = "Token verified";
        user.isVerified = "true";
        await user.save();
        return res.status(200).json({
          success: true,
          message: `${userName} Verified successfully..`,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Internal server error..",
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email.trim() || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Fields can not be empty..",
      });
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found..",
      });
    }
    const comparePassword = bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials..",
      });
    } else if (comparePassword && user.isVerified === true) {
      const accessToken = jwt.sign(
        { id: user._id, userName: user.userName },
        process.env.secretKey,
        {
          expiresIn: "10days",
        },
      );
      const refreshToken = jwt.sign(
        { id: user._id, userName: user.userName },
        process.env.secretKey,
        {
          expiresIn: "30days",
        },
      );
      user.isLoggedIn = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: `${user.userName} logged In .... Welcome ${user.userName}, Good to see you here!!`,
        accessToken: accessToken,
        refreshToken: refreshToken,
        data: user,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Please kindly verify your token and then try again..",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server Error..",
    });
  }
};

export { registerUser, verifyToken, logIn };

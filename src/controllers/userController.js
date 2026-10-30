import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();
import { verifyEmail } from "../nodemailer/nodeMailer.js";
import { sessionModel } from "../models/sessionModel.js";

const registerUser = async (req, res) => {
  try {
    const { userName, email, password, phone } = req.body;
    // if (!phoneNumber || !userName.trim() || !email.trim() || !password.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All fields must be present..and phone must be in number.",
    //   });
    // }

    const existingUser = await userModel.findOne({
      $or: [
        {
          email: email.trim(),
        },
        {
          userName: userName.trim(),
        },
      ],
    });
    if (existingUser) {
      const fieldPresent = existingUser.email === email ? "email" : "userName";
      return res.status(409).json({
        success: false,
        message: `That ${fieldPresent} is already registered. Please use another one.`,
      });
    }

    //  hashing password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = await userModel.create({
      userName: userName.trim(),
      email: email.trim(),
      phone: phone,
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
    console.log(error);
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

const reVerifyToken = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Field must be required",
      });
    }
    const user = await userModel.findOne({ email: email.trim() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please register first for re verification.",
      });
    } else if (user.isVerified === true) {
      return res.status(400).json({
        success: false,
        message: "You are already verified.",
      });
    }
    const newToken = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.secretKey,
      {
        expiresIn: "10m",
      },
    );
    user.token = newToken;
    try {
      await verifyEmail(newToken, email);
    } catch (error) {
      console.log(error.message, error.cause);
      return res.status(500).json({
        success: false,
        message: "Error in sending email.",
      });
    }
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Kindly verify within 10 mins.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const generateAccessToken = async (req, res) => {
  try {
    const authRefreshHeader = req.headers.authorization;
    if (!authRefreshHeader || !authRefreshHeader.startsWith("Bearer")) {
      return res.status(400).json({
        success: false,
        message: "Token not found..",
      });
    }
    const refreshToken = authRefreshHeader.split(" ")[1];
    jwt.verify(refreshToken, process.env.secretKey, async (err, decode) => {
      if (err) {
        if (err.message === "ExpiredTokenError") {
          return res.status(401).json({
            success: false,
            message: "Token Expired",
          });
        }
        return res.status(401).json({
          success: false,
          message: "Token invalid or expired.",
        });
      }
      const { id, sessionId } = decode;
      const user = await userModel.findOne({ _id: id });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found..",
        });
      }
      const activeSessionRefresh = await sessionModel.findOne({
        _id: sessionId,
        userId: id,
      });

      if (!activeSessionRefresh) {
        return res.status(401).json({
          success: false,
          message:
            "User not found in this session for regenerating access token.",
        });
      }
      const newAccessToken = jwt.sign(
        { id: id, sessionId: sessionId },
        process.env.secretKey,
        {
          expiresIn: "10days",
        },
      );
      return res.status(201).json({
        success: true,
        message: "New Access Token generated.",
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // if (!email.trim() || !password.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Fields can not be empty..",
    //   });
    // }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found..",
      });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials..",
      });
    } else if (comparePassword && user.isVerified === true) {
      // creating new session
      const newSession = await sessionModel.create({ userId: user._id });

      // find all sessions, more than 3 terminate
      const existingSession = await sessionModel.find({ userId: user._id });
      if (existingSession && existingSession.length > 3) {
        await sessionModel.deleteMany({ userId: user._id });
        return res.status(400).json({
          success: false,
          message:
            "Device limit exceed (max 3 devices). All session terminated. Please log in again.",
        });
      }

      const accessToken = jwt.sign(
        { id: user._id, sessionId: newSession._id },
        process.env.secretKey,
        {
          expiresIn: "10days",
        },
      );
      const refreshToken = jwt.sign(
        { id: user._id, sessionId: newSession._id },
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
        session: newSession._id,
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

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "New Password and Confirm Password does not match.",
      });
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found, Register first..",
      });
    }
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashPassword;
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Password Updated Successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const logOut = async (req, res) => {
  try {
    const activeSession = await sessionModel.findOne({ _id: req.sessionId });
    const user = await userModel.findOne({ _id: req.userId });

    if (activeSession) {
      await sessionModel.findOneAndDelete({ _id: req.sessionId });
      user.isLoggedIn = false;
      await user.save();
      return res.status(200).json({
        success: true,
        message: `${user.userName} log out successfully!`,
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "No active user session found!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const logOutAll = async (req, res) => {
  try {
    const activeAllSession = await sessionModel.find({ userId: req.userId });
    const user = await userModel.findOne({ _id: req.userId });

    if (activeAllSession && activeAllSession.length > 0) {
      await sessionModel.deleteMany({ userId: req.userId });
      user.isLoggedIn = false;
      await user.save();
      return res.status(200).json({
        success: true,
        message: `${user.userName} log out from all devices successfully!`,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No active user session found!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export {
  registerUser,
  verifyToken,
  reVerifyToken,
  logIn,
  forgotPassword,
  logOut,
  logOutAll,
  generateAccessToken,
};

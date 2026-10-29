import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import { sessionModel } from "../models/sessionModel.js";

export const userToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.trim().startsWith("Bearer")) {
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
        // extracting sessionId also to determine in which session is on
        const { id, sessionId } = decoded;
        const user = await userModel.findOne({ _id: id });
        if (!user) {
          return res.status(400).json({
            success: false,
            message: "User not found to access anything..",
          });
        }
        const activeSessionExists = await sessionModel.findOne({
          _id: sessionId,
        });
        if (!activeSessionExists) {
          return res.status(404).json({
            success: true,
            message: "No session found or expired!",
          });
        }

        req.userId = id;
        req.sessionId = sessionId;
        next();
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error..",
    });
  }
};

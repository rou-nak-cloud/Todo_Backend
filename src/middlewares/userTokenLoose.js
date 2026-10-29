import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
export async function userTokenLoose(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(400).json({
        success: false,
        message: "Token can't be empty!",
      });
    }
    const looseToken = authHeader.split(" ")[1];
    jwt.verify(looseToken, process.env.secretKey, async (err, decode) => {
      if (err) {
        if (err.message === "ExpiredTokenError") {
          return res.status(404).json({
            success: false,
            message: "Token Expired",
          });
        }
        return res.status(404).json({
          success: false,
          message: "Token invalid or expired",
        });
      }
      const { id } = decode;
      const user = await userModel.findOne({ _id: id });
      if (!user) {
        return res.status(404).json({
          success: true,
          message: "User not found.. Log in first..",
        });
      }
      req.userId = id;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

import express from "express";
import {
  logIn,
  registerUser,
  verifyToken,
} from "../controllers/userController.js";
const userRoute = express.Router();

userRoute.post("/register", registerUser);
userRoute.get("/verify", verifyToken);
userRoute.post("/login", logIn);

export default userRoute;

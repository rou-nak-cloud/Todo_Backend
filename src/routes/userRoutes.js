import express from "express";
import {
  generateAccessToken,
  logIn,
  logOut,
  logOutAll,
  registerUser,
  verifyToken,
} from "../controllers/userController.js";
import { userToken } from "../middlewares/userToken.js";
import { userTokenLoose } from "../middlewares/userTokenLoose.js";
const userRoute = express.Router();

userRoute.post("/register", registerUser);
userRoute.get("/verify", verifyToken);
userRoute.post("/login", logIn);
userRoute.get("/refresh", generateAccessToken);
userRoute.delete("/logout", userToken, logOut);
userRoute.delete("/logoutAll", userTokenLoose, logOutAll);

export default userRoute;

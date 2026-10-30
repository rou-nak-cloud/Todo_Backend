import express from "express";
import {
  forgotPassword,
  generateAccessToken,
  logIn,
  logOut,
  logOutAll,
  registerUser,
  reVerifyToken,
  verifyToken,
} from "../controllers/userController.js";
import { userToken } from "../middlewares/userToken.js";
import { userTokenLoose } from "../middlewares/userTokenLoose.js";
import {
  forgotPassValidate,
  loginSchema,
  registerSchema,
  validateUser,
} from "../validators/userValidate.js";
const userRoute = express.Router();

userRoute.post("/register", validateUser(registerSchema), registerUser);
userRoute.get("/verify", verifyToken);
userRoute.post("/reverify", reVerifyToken);
userRoute.post("/login", validateUser(loginSchema), logIn);
userRoute.post("/forgotPass", validateUser(forgotPassValidate), forgotPassword);
userRoute.get("/refresh", generateAccessToken);
userRoute.delete("/logout", userToken, logOut);
userRoute.delete("/logoutAll", userTokenLoose, logOutAll);

export default userRoute;

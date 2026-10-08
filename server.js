import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDb } from "./src/config/dbConnect.js";
import todoRoute from "./src/routes/todoRoutes.js";
import userRoute from "./src/routes/userRoutes.js";
const app = express();

connectDb();
app.use(express.json());

app.use("/api/todo", todoRoute);
app.use("/api/user", userRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server runs at this ${process.env.port} port.`);
});

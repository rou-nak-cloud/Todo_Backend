import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDb } from "./src/config/dbConnect.js";
import todoRoute from "./src/routes/todoRoutes.js";
const app = express();

connectDb();
app.use(express.json());

app.use("/todo", todoRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server runs at this ${process.env.port} port.`);
});

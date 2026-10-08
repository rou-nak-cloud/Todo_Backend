import express from "express";
import {
  createTodo,
  delTodo,
  getTodos,
  updateTodo,
} from "../controllers/todoController.js";
import { userToken } from "../middlewares/userToken.js";
const todoRoute = express.Router();

todoRoute.post("/addTask", userToken, createTodo);
todoRoute.get("/getTask", userToken, getTodos);
todoRoute.put("/updateTask/:taskId", userToken, updateTodo);
todoRoute.delete("/delTask/:taskId", userToken, delTodo);

export default todoRoute;

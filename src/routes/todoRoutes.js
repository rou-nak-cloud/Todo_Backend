import express from "express";
import {
  createTodo,
  delTodo,
  getTodos,
  updateTodo,
} from "../controllers/todoController.js";
const todoRoute = express.Router();

todoRoute.post("/addTask", createTodo);
todoRoute.get("/getTask", getTodos);
todoRoute.put("/updateTask/:taskId", updateTodo);
todoRoute.delete("/delTask/:taskId", delTodo);

export default todoRoute;

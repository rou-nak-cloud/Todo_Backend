import express from "express";
import {
  createTodo,
  delTodo,
  getTodos,
  paginateAllTodos,
  toggleTodoStatus,
  updateTodo,
} from "../controllers/todoController.js";
import { userToken } from "../middlewares/userToken.js";
import {
  titleValidate,
  toggleStatusValidate,
  validateTodo,
} from "../validators/todoValidate.js";
const todoRoute = express.Router();

todoRoute.post("/addTask", userToken, validateTodo(titleValidate), createTodo);
todoRoute.get("/getTask", userToken, getTodos);
todoRoute.get("/getTaskPage", userToken, paginateAllTodos);
todoRoute.put(
  "/updateTask/:taskId",
  userToken,
  validateTodo(titleValidate),
  updateTodo,
);
todoRoute.put(
  "/toggleTask/:taskId",
  userToken,
  validateTodo(toggleStatusValidate),
  toggleTodoStatus,
);
todoRoute.delete("/delTask/:taskId", userToken, delTodo);

export default todoRoute;

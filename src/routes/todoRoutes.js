import express from "express";
import {
  createTodo,
  delTodo,
  getTodos,
  paginateAllTodos,
  updateTodo,
} from "../controllers/todoController.js";
import { userToken } from "../middlewares/userToken.js";
import { titleValidate, validateTodo } from "../validators/todoValidate.js";
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
todoRoute.delete("/delTask/:taskId", userToken, delTodo);

export default todoRoute;

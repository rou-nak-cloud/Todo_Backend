import todoModel from "../models/todoModel.js";

const createTodo = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Todo title is required and cannot be empty.",
      });
    }

    const existingTask = await todoModel.findOne({ title: title.trim() });
    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: "A todo with this title already exists.",
      });
    }
    const tasks = await todoModel.create({ title: title.trim() });

    res.status(201).json({
      success: true,
      message: "Todo created..",
      todos: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server Error..",
    });
  }
};

const getTodos = async (req, res) => {
  try {
    const tasks = await todoModel.find({});
    if (!tasks) {
      return res.status(400).json({
        success: false,
        message: "No Todo's yet...",
      });
    }
    res.status(200).json({
      success: true,
      message: "All todos are fetched..",
      todos: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server Error..",
    });
  }
};

const updateTodo = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Todo title is required and cannot be empty.",
      });
    }

    const existingTasks = await todoModel.findById({ _id: taskId });
    if (!existingTasks) {
      return res.status(404).json({
        success: false,
        message: "Todo not found..",
      });
    }
    if (existingTasks.title === title.trim()) {
      return res.status(200).json({
        success: true,
        message: "Todo title is already up to date. No need to change.",
        todo: existingTasks,
      });
    }

    const updateTasks = await todoModel.findByIdAndUpdate(
      { _id: taskId },
      { title: title.trim() },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Task Updated..",
      todos: updateTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server Error..",
    });
  }
};

const delTodo = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const deletedTasks = await todoModel.findByIdAndDelete({ _id: taskId });
    if (!deletedTasks) {
      return res.status(404).json({
        success: false,
        message: "Todo not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully..",
      todos: deletedTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server Error..",
    });
  }
};

export { createTodo, getTodos, updateTodo, delTodo };

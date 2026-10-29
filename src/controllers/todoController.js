import todoModel from "../models/todoModel.js";

const createTodo = async (req, res) => {
  try {
    const { title } = req.body;
    // if (!title || !title.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Todo title is required and cannot be empty.",
    //   });
    // }

    const existingTask = await todoModel.findOne({
      title: title.trim(),
      userId: req.userId,
    });
    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: "A todo with this title already exists.",
      });
    }
    const tasks = await todoModel.create({
      title: title.trim(),
      userId: req.userId,
      sessionUserId: req.sessionId,
    });

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
    const tasks = await todoModel.find({ userId: req.userId });
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

const paginateAllTodos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const someTasks = await todoModel
      .find({ userId: req.userId })
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      success: true,
      message: "Todo fetched Successfully",
      data: someTasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Internal server error.",
    });
  }
};

const updateTodo = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title } = req.body;

    // if (!title || !title.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Todo title is required and cannot be empty.",
    //   });
    // }

    const existingTaskPresent = await todoModel.findById({ _id: taskId });
    if (!existingTaskPresent) {
      return res.status(404).json({
        success: false,
        message: "Todo not found.",
      });
    }

    const existingTasks = await todoModel.findOne({
      _id: taskId,
      userId: req.userId,
    });
    if (!existingTasks) {
      return res.status(404).json({
        success: false,
        message: "Todo not found in your profile..",
      });
    }
    if (existingTasks.title === title.trim()) {
      return res.status(200).json({
        success: true,
        message: "Todo title is already up to date. No need to change.",
        todo: existingTasks,
      });
    }

    const updateTasks = await todoModel.findOneAndUpdate(
      { _id: taskId, userId: req.userId },
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

const toggleTodoStatus = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { completed } = req.body;

    const exactTodo = await todoModel.findOne({
      _id: taskId,
      userId: req.userId,
    });
    if (!exactTodo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found.",
      });
    }
    exactTodo.completed = completed;
    await exactTodo.save();
    return res.status(200).json({
      success: true,
      message: "Todo status updated successfully",
      data: exactTodo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const delTodo = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const deleteTaskPresent = await todoModel.findById({
      _id: taskId,
    });
    if (!deleteTaskPresent) {
      return res.status(404).json({
        success: false,
        message: "Todo not found.",
      });
    }

    const deletedTasks = await todoModel.findOneAndDelete({
      _id: taskId,
      userId: req.userId,
    });
    if (!deletedTasks) {
      return res.status(400).json({
        success: false,
        message: "You don't have permission to delete this Todo..",
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

export {
  createTodo,
  getTodos,
  paginateAllTodos,
  updateTodo,
  toggleTodoStatus,
  delTodo,
};

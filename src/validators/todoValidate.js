import * as y from "yup";

export const titleValidate = y.object({
  title: y
    .string()
    .trim()
    .required()
    .min(3, "Title must be 3 characters long."),
});
// export const updateTitleValidate = y.object({
//   title:y
//     .string()
//     .trim()
//     .required()
//     .min(3,'Title must be 3 characters long.')
// })

export const toggleStatusValidate = y.object({
  completed: y
    .boolean()
    .required(
      "The completed field is required and must be a boolean (true or false).",
    ),
});

export const validateTodo = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ errors: error.errors });
  }
};

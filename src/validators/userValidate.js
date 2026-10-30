import * as y from "yup";

export const registerSchema = y.object({
  userName: y
    .string()
    .trim()
    .min(3, "userName must be 3 characters.")
    .required("You don't have a Name?"),
  email: y.string().email("The email is not a valid email address.").required(),
  phone: y
    .string()
    .trim()
    .matches(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Please enter a valid phone number.",
    )
    .required("Phone number is required."),
  password: y
    .string()
    .trim()
    .required("Enter a password")
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
    //   "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character",
    // )
    .test(
      "minLength",
      "Password Must be at least 8 characters long",
      (val) => val && val.length >= 8,
    )
    .test(
      "maxLength",
      "Password Must be at most 12 characters long",
      (val) => val && val.length <= 12,
    )
    .test(
      "uppercase",
      "Password Must contain at least one uppercase letter",
      (val) => val && /[A-Z]/.test(val),
    )
    .test(
      "lowercase",
      "Password Must contain at least one lowercase letter",
      (val) => val && /[a-z]/.test(val),
    )
    .test(
      "number",
      "Password Must contain at least one number",
      (val) => val && /[0-9]/.test(val),
    )
    .test(
      "special",
      "Password Must contain at least one special character",
      (val) => val && /[!@#\$%\^&\*]/.test(val),
    ),
});

export const loginSchema = y.object({
  email: y.string().email("Invalid email").required("Email is required").trim(),
  password: y.string().required("Password is required"),
});

export const forgotPassValidate = y.object({
  email: y.string().email("The email is not a valid email address.").required(),
  newPassword: y
    .string()
    .trim()
    .required("Enter a password")
    .test(
      "minLength",
      "Password Must be at least 8 characters long",
      (val) => val && val.length >= 8,
    )
    .test(
      "maxLength",
      "Password Must be at most 12 characters long",
      (val) => val && val.length <= 12,
    )
    .test(
      "uppercase",
      "Password Must contain at least one uppercase letter",
      (val) => val && /[A-Z]/.test(val),
    )
    .test(
      "lowercase",
      "Password Must contain at least one lowercase letter",
      (val) => val && /[a-z]/.test(val),
    )
    .test(
      "number",
      "Password Must contain at least one number",
      (val) => val && /[0-9]/.test(val),
    )
    .test(
      "special",
      "Password Must contain at least one special character",
      (val) => val && /[!@#\$%\^&\*]/.test(val),
    ),
});

// export const emailSchema = y.object({
//   email: y.string().email("Invalid email").required("Email is required").trim(),
// });

export const validateUser = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, {
      abortEarly: false, // false to catch ALL errors at once. not just 1 error
    });
    next();
  } catch (error) {
    return res.status(400).json({
      errors: error.errors,
    });
  }
};

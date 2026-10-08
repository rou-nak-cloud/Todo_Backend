import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const verifyEmail = async (token, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.devMail,
      pass: process.env.devPass,
    },
  });

  const mailConfigurations = {
    from: process.env.devMail,
    to: email,
    subject: "Email Verification.",
    text: `Kindly verify your token [${token}]`,
  };

  try {
    const info = await transporter.sendMail(mailConfigurations);
    console.log("Email sent successfully..");
    console.log(info);
  } catch (error) {
    console.log("Error in sending Email", error);
    throw new Error(error);
  }
};

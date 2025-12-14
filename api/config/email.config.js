import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); //Because it must be loaded before using process.env

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server ready");
  }
});

export default transporter;
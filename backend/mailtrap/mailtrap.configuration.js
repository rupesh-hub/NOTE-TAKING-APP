// mailtrap.configuration.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create a transporter using Mailtrap SMTP settings
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD, 
  }
});

export const sender = {
  email: "dulalrupesh77@gmail.com",
  name: "Comprehensive Collaborative Note Taking Application",
};


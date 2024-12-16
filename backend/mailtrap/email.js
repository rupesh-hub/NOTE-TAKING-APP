// email.js
import { sender, transporter } from "./mailtrap.configuration.js";
import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./email-template.js";

const sendEmail = async (to, subject, htmlContent, category) => {
  try {
    const info = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`,
      to, // recipient's email
      subject, // subject of the email
      html: htmlContent, // email content in HTML format
      headers: {
        'X-Category': category, // Add a custom category header for better organization
      },
    });
    console.log(`${category} email sent successfully:`, info);
  } catch (error) {
    console.error(`Error sending ${category} email:`, error.message);
    throw new Error(error.message);
  }
};

// Send Verification Email
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const subject = `Hello ${name}, please verify your email.`;
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace("{name}", name).replace("{verificationCode}", verificationToken);
  await sendEmail(email, subject, htmlContent, "Email Verification");
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const subject = `Welcome ${name}, to the Comprehensive Collaborative Note Taking Application!`;
  const htmlContent = WELCOME_EMAIL_TEMPLATE.replace("{name}", name);
  await sendEmail(email, subject, htmlContent, "Welcome Email");
};

// Send Reset Password Email
export const sendResetPasswordEmail = async (email, name, url) => {
  const subject = `Reset Password Request for ${name}`;
  const htmlContent = `
    <h1>Reset Password Request</h1>
    <p>Hello ${name},</p>
    <p>You have requested a password reset for your account.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${url}">Reset Password</a>
  `;
  await sendEmail(email, subject, htmlContent, "Reset Password Request");
};

// Send Reset Password Success Email
export const sendResetSuccessEmail = async (email, name) => {
  const subject = `Password Reset Successful for ${name}`;
  const htmlContent = `
    <h1>Password Reset Successful</h1>
    <p>Hello ${name},</p>
    <p>Your password has been successfully reset.</p>
    <p>You can now log in with your new password.</p>
  `;
  await sendEmail(email, subject, htmlContent, "Reset Password Success");
};

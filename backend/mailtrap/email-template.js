export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Comprehensive Collaborative Note Taking Application</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .header {
            background: linear-gradient(135deg, #3494E6, #2D73BC);
            color: white;
            text-align: center;
            padding: 25px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .verification-code {
            background-color: #f0f0f0;
            text-align: center;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .verification-code span {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #2D73BC;
        }
        .footer {
            text-align: center;
            color: #888;
            font-size: 0.8em;
            margin-top: 20px;
            padding: 10px;
        }
        .app-name {
            color: #3494E6;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Verify Your Email for <span class="app-name">Comprehensive Collaborative Note Taking Application</span></h1>
    </div>
    
    <div class="content">
        <p>Hello {name},</p>
        
        <p>Welcome to <span class="app-name">Collab Notes</span>! We're excited to have you join our collaborative note-taking community. To complete your registration and secure your account, please use the verification code below.</p>
        
        <div class="verification-code">
            <span>{verificationCode}</span>
        </div>
        
        <p>Please enter this code on the verification page within <strong>15 minutes</strong>. After this time, the code will expire for security purposes.</p>
        
        <p>If you did not create an account with <span class="app-name">Collab Notes</span>, please ignore this email or contact our support team.</p>
        
        <p>Best regards,<br>The Comprehensive Collaborative Note Taking Application Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Hello {name}, password reset successful!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Hello {name}, password reset!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Collab Notes</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f6f9;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8B9F82, #7A8E72);
            color: white;
            text-align: center;
            padding: 30px 20px;
            position: relative;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            opacity: 0.2;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .content {
            padding: 30px;
            background-color: white;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8B9F82, #7A8E72);
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .footer {
            background-color: #f4f6f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
        .unsubscribe {
            color: #8B9F82;
            text-decoration: underline;
            cursor: pointer;
        }
        .highlight {
            color: #8B9F82;
            font-weight: bold;
        }
        ul {
            padding-left: 20px;
        }
        ul li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://img.freepik.com/free-photo/welcome-phrase-available-launch-open_53876-124476.jpg?semt=ais_hybrid" alt="Collab Notes Background" class="header-image">
            <div class="header-content">
                <h1>Welcome to Collab Notes, {name}!</h1>
            </div>
        </div>
        
        <div class="content">
            <p>Congratulations on creating your <span class="highlight">Collab Notes</span> account! You're now part of a powerful collaborative ecosystem designed to transform the way you capture, share, and work with ideas.</p>
            
            <p>Here's what makes <span class="highlight">Collab Notes</span> special:</p>
            
            <ul>
                <li>🚀 Real-time collaborative editing</li>
                <li>🔒 Bank-grade security for your notes</li>
                <li>🌐 Access from any device, anywhere</li>
                <li>🤝 Seamless team collaboration</li>
            </ul>
            
            <p>Ready to dive in and supercharge your productivity?</p>
            
            <a href="#" class="cta-button">Start Collaborating Now</a>
            
            <p>If you have any questions, our support team is always here to help. Just reply to this email or visit our help center.</p>
            
            <p>Welcome aboard!</p>
            <p>Best regards,<br>The Collab Notes Team</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Collab Notes. All rights reserved.</p>
            <p>If you no longer wish to receive these emails, <a href="#" class="unsubscribe">unsubscribe here</a>.</p>
        </div>
    </div>
</body>
</html>

`;

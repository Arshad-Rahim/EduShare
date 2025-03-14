export const config = {
  otpTemplate: (otp: number) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background: #007bff;
            color: #ffffff;
            padding: 15px;
            font-size: 24px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .otp {
            font-size: 22px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
            display: inline-block;
            padding: 10px 20px;
            background: #f1f1f1;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">OTP Verification</div>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <div class="otp">${otp}</div>
        <p>Please use this OTP to complete your process. It will expire in 1 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <div class="footer">&copy; 2025 EduShare. All rights reserved.</div>
    </div>
</body>
</html>`,
};
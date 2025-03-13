const nodemailer = require('nodemailer');


export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Replace with your provider's SMTP server
  port: 587, // Port may vary depending on your provider
  secure: false, // Use true for TLS, false for non-TLS (consult your provider)
  auth: {
    user: "edushare.org@gmail.com", // Replace with your email address
    pass: "kugi zioc mufq xstm", // Replace with your email password
  },
});


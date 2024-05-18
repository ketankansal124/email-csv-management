const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async function (email, title, body) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "MathonGo",
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.error(`Error in Mail: ${error.message}`);
  }
};



module.exports = mailSender;

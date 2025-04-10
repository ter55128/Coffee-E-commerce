const nodemailer = require("nodemailer");

// 創建郵件傳輸器
const transporter = nodemailer.createTransport({
  service: "gmail", // 使用 Gmail
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // 您的 Gmail 帳號
    pass: process.env.EMAIL_PASS, // 您的 Gmail 應用程式密碼
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("Server connected");
  }
});

// 發送重設密碼郵件
const sendResetPasswordEmail = async (email, resetToken) => {
  // 重設密碼的連結
  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

  // 郵件內容
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "重設您的密碼 - Coffee Shop",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2c3e50; text-align: center;">重設密碼</h2>
        <p style="color: #34495e; line-height: 1.6;">
          您好，<br><br>
          我們收到了重設密碼的請求。如果這不是您發起的請求，請忽略此郵件。<br>
          如果是您請求重設密碼，請點擊下方按鈕：
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #3498db; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block;">
            重設密碼
          </a>
        </div>
        <p style="color: #7f8c8d; font-size: 0.9em; text-align: center;">
          此連結將在一小時後失效。<br>
          如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
          ${resetLink}
        </p>
        <hr style="border: 1px solid #ecf0f1; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 0.8em; text-align: center;">
          此郵件由系統自動發送，請勿直接回覆。
        </p>
      </div>
    `,
  };

  // 發送郵件
  try {
    await transporter.sendMail(mailOptions);
    console.log("郵件發送成功:");
    return true;
  } catch (error) {
    console.error("發送郵件失敗:", error);
    return false;
  }
};

module.exports = { sendResetPasswordEmail };

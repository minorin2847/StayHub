import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  token: string,
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/new-password?token=${token}`;

  const mailOptions = {
    from: `"Stayhub Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu Stayhub",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Xin chào ${firstName} ${lastName}</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Stayhub.</p>
        <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu (Link có hiệu lực trong 60 phút):</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
           Đặt lại mật khẩu ngay
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

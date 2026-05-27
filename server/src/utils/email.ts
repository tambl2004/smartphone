import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

export const sendOtpEmail = async (to: string, otp: string, purpose: 'register' | 'reset') => {
  const transporter = createTransporter();

  const isRegister = purpose === 'register';
  const subject = isRegister
    ? '[NEXPHONE] Mã xác thực đăng ký tài khoản'
    : '[NEXPHONE] Mã xác thực đặt lại mật khẩu';

  const action = isRegister ? 'hoàn tất đăng ký tài khoản' : 'đặt lại mật khẩu';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #0a0a0a; padding: 32px 40px; }
        .logo { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .body { padding: 40px; }
        .title { font-size: 20px; font-weight: 700; color: #0a0a0a; margin: 0 0 12px; }
        .desc { font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 32px; }
        .otp-box { background: #f0f0f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
        .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #0a0a0a; }
        .expire { font-size: 13px; color: #888; margin-top: 8px; }
        .footer { padding: 24px 40px; border-top: 1px solid #f0f0f0; }
        .footer-text { font-size: 12px; color: #999; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NEXPHONE</div>
        </div>
        <div class="body">
          <div class="title">Mã xác thực của bạn</div>
          <div class="desc">Sử dụng mã OTP dưới đây để ${action}. Mã có hiệu lực trong <strong>10 phút</strong>.</div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expire">Hết hạn sau 10 phút</div>
          </div>
          <div class="desc" style="font-size:13px;color:#888;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</div>
        </div>
        <div class="footer">
          <div class="footer-text">© 2026 NEXPHONE. Mọi quyền được bảo lưu.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"NEXPHONE" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};

import nodemailer from "nodemailer";
import models from "../model/init.js";

const { OTPCode } = models;
const EXPIRY_MINUTES = 5;
const COOL_DOWN_SECONDS = 60; // 60 giây giữa các lần gửi

// --- CẤU HÌNH NODEMAILER ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Dùng false cho port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Tăng thời gian chờ
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// Kiểm tra kết nối transporter (Chỉ chạy khi khởi động)
transporter
  .verify()
  .then(() => console.log("✅ SMTP transporter is ready"))
  .catch((error) =>
    console.error("❌ SMTP connection failed. Check config:", error.message)
  );

// -------------------------------------------------------------------
// 📧 HÀM SERVICE: Gửi Email (Chỉ chịu trách nhiệm gửi mail)
// -------------------------------------------------------------------

const sendOtpEmail = async (toEmail, otpCode, type) => {
  let subject, action;

  if (type === "reset_password") {
    subject = "Mã OTP Đặt lại Mật khẩu";
    action = "đặt lại mật khẩu";
  } else if (type === "register") {
    subject = "Mã OTP Xác nhận Đăng ký";
    action = "xác nhận đăng ký";
  } else {
    subject = "Mã OTP của bạn";
    action = "xác nhận";
  }

  try {
    const mailOptions = {
      from: `"SweetShop" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: `Mã OTP ${action} của bạn: ${otpCode}. Mã có hiệu lực trong ${EXPIRY_MINUTES} phút.`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                     <h2 style="color: #d63384;">SweetShop - Mã OTP</h2>
                     <p>Mã OTP của bạn cho việc <strong>${action}</strong> là:</p>
                     <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                       <h3 style="color: #d63384; margin: 0; font-size: 24px; letter-spacing: 5px;">
                         ${otpCode}
                       </h3>
                     </div>
                     <p><strong>Lưu ý:</strong> Mã OTP có hiệu lực trong ${EXPIRY_MINUTES} phút.</p>
                     <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                     <hr style="border: none; border-top: 1px solid #eee;">
                     <p style="color: #666; font-size: 12px;">Đội ngũ SweetShop</p>
                   </div>`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${toEmail}, Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    // Ném lỗi chi tiết hơn
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Không thể kết nối đến máy chủ email. Vui lòng kiểm tra cấu hình SMTP."
      );
    } else if (error.responseCode === 535 || error.responseCode === 401) {
      throw new Error(
        "Lỗi xác thực email. Vui lòng kiểm tra tên đăng nhập và mật khẩu ứng dụng."
      );
    } else {
      throw new Error(`Lỗi gửi email: ${error.message}`);
    }
  }
};

// -------------------------------------------------------------------
// 🎯 CÁC HÀM SERVICE THUẦN TÚY (Dùng cho Auth Controller với Transaction)
// -------------------------------------------------------------------

/**
 * 🔍 Kiểm tra tính hợp lệ và thời hạn của OTP
 * (Được gọi nội bộ từ các controller khác, ví dụ: resetPassword)
 * @param {string} email
 * @param {string} code
 * @param {string} type
 * @param {object} transaction (Tùy chọn)
 * @returns {boolean} True nếu OTP hợp lệ và chưa hết hạn
 */
export const verifyOtpService = async (
  { email, code, type },
  transaction = null
) => {
  const otpRecord = await OTPCode.findOne({
    where: { email, code, type },
    transaction,
    order: [["created_at", "DESC"]],
  });

  if (!otpRecord) {
    return false;
  }

  const now = new Date();
  if (now > otpRecord.expires_at) {
    // Tùy chọn: Xóa OTP hết hạn ngay lập tức
    await OTPCode.destroy({ where: { email, type }, transaction });
    return false;
  }

  return true;
};

/**
 * 🗑️ Vô hiệu hóa/Xóa OTP sau khi sử dụng thành công (ví dụ: đặt lại mật khẩu/đăng ký)
 * (Được gọi nội bộ từ các controller khác)
 * @param {string} email
 * @param {string} type
 * @param {object} transaction (Tùy chọn)
 */
export const invalidateOtpService = async (
  { email, type },
  transaction = null
) => {
  await OTPCode.destroy({
    where: { email, type },
    transaction,
  });
  console.log(`[SERVICE] OTP đã vô hiệu hóa cho ${email}, type: ${type}`);
};

// -------------------------------------------------------------------
// 🌐 CÁC HÀM CONTROLLER (Được mapping với API endpoint)
// -------------------------------------------------------------------

/**
 * 📤 API Controller: Yêu cầu Gửi OTP
 */
export const sendOtp = async (req, res) => {
  try {
    const { email, type = "register" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc." });
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + EXPIRY_MINUTES * 60 * 1000);

    // 1. Kiểm tra Cool Down
    const lastOtp = await OTPCode.findOne({
      where: { email, type },
      order: [["created_at", "DESC"]],
    });

    if (lastOtp && (now - lastOtp.created_at) / 1000 < COOL_DOWN_SECONDS) {
      const remain =
        COOL_DOWN_SECONDS - Math.floor((now - lastOtp.created_at) / 1000);
      return res.status(429).json({
        message: `Vui lòng đợi ${remain} giây trước khi gửi lại mã OTP.`,
      });
    }

    // 2. Tạo và Lưu OTP mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Xóa OTP cũ và tạo mới trong một lần:
    await OTPCode.destroy({ where: { email, type } });
    await OTPCode.create({
      email,
      code: otpCode,
      type: type,
      created_at: now,
      expires_at: expiryDate,
    });

    // 3. Gửi email
    await sendOtpEmail(email, otpCode, type);

    console.log(`[OTP] Sent successfully to ${email}, type: ${type}`);
    return res.json({
      message: `Mã OTP đã được gửi đến ${email} và có hiệu lực trong ${EXPIRY_MINUTES} phút.`,
      coolDown: COOL_DOWN_SECONDS,
    });
  } catch (error) {
    console.error(`[OTP] Send error (${req.body.email}):`, error.message);

    let errorMessage = "Lỗi hệ thống khi gửi OTP.";
    if (error.message.includes("Không thể kết nối")) {
      errorMessage = "Lỗi kết nối email. Vui lòng thử lại sau.";
    } else if (error.message.includes("xác thực")) {
      errorMessage = "Lỗi cấu hình email. Vui lòng liên hệ quản trị viên.";
    } else if (error.message.includes("Lỗi gửi email")) {
      errorMessage = error.message; // Trả về lỗi chi tiết từ hàm gửi email
    }

    return res.status(500).json({ message: errorMessage });
  }
};

/**
 * ✅ API Controller: Xác thực OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, code, type = "register" } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Thiếu email hoặc mã OTP." });
    }

    // Sử dụng hàm service để kiểm tra
    const isVerified = await verifyOtpService({ email, code, type });

    if (!isVerified) {
      // Để tránh side channel attack, ta nên trả về thông báo chung chung hơn
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
    }

    // Xóa OTP sau khi xác thực thành công (vì đây là endpoint API chung)
    await invalidateOtpService({ email, type });

    console.log(`[OTP] Verified successfully for ${email}, type: ${type}`);
    return res.json({
      message: "Xác thực OTP thành công!",
      verified: true,
    });
  } catch (error) {
    console.error(`[OTP] Verify error (${req.body.email}):`, error);
    return res.status(500).json({ message: "Lỗi hệ thống khi xác thực OTP." });
  }
};

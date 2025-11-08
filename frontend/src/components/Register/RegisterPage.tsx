"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
// ✅ Đã sửa lỗi: Thay đổi 'NetWork' thành 'network' để khắc phục lỗi phân giải module
import { requestRegistrationOtp, finalizeRegistration } from "../../NetWork/auth.api";

interface RegisterPageProps {
    onClose: () => void;
    onSwitchToLogin: (email?: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({
    onClose,
    onSwitchToLogin,
}) => {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ========================
    // 🔹 BƯỚC 1: YÊU CẦU GỬI MÃ XÁC THỰC (Sử dụng API requestRegistrationOtp)
    // ========================
    const handleRequestOtp = async () => {
        setError("");
        setMessage("");

        if (!fullname || !email || !password || !confirmPassword) {
            return setError("⚠️ Vui lòng điền đầy đủ thông tin trước khi gửi mã.");
        }
        if (password !== confirmPassword) {
            return setError("⚠️ Mật khẩu nhập lại không khớp!");
        }

        setIsLoading(true);
        try {
            // ✅ API mới: Gửi tất cả thông tin đăng ký để server kiểm tra và gửi OTP
            const res = await requestRegistrationOtp({
                name: fullname,
                email,
                password
            });

            if (res.success) {
                setIsOtpSent(true);
                setMessage(res.message || "📧 Mã xác thực đã được gửi tới email của bạn!");
            } else {
                // Server trả về lỗi: Có thể là mật khẩu yếu hoặc email đã tồn tại
                setError(res.message || "Không thể gửi mã xác thực!");
            }
        } catch {
            setError("🚫 Lỗi kết nối máy chủ! Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    // ========================
    // 🔹 BƯỚC 2: XÁC THỰC MÃ VÀ HOÀN TẤT TẠO TÀI KHOẢN (Sử dụng API finalizeRegistration)
    // ========================
    const handleFinalizeRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        if (otp.length !== 6) {
            return setError("⚠️ Mã OTP phải có 6 chữ số.");
        }
        setIsLoading(true);

        try {
            // ✅ API mới: Gửi tất cả thông tin + mã OTP để server xác thực và tạo tài khoản
            const result = await finalizeRegistration({
                name: fullname,
                email,
                password,
                code: otp,
            });

            if (result.success) {
                setMessage(result.message || "🎉 Xác thực và đăng ký thành công!");
                setTimeout(() => {
                    // Chuyển sang trang đăng nhập sau khi đăng ký hoàn tất
                    onClose();
                    onSwitchToLogin(email);
                }, 1500);
            } else {
                // Lỗi có thể là OTP hết hạn/sai, hoặc lỗi server khi tạo user
                setError(result.message || "❌ Mã xác thực không hợp lệ hoặc đã hết hạn.");
            }
        } catch {
            setError("🚫 Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    // ========================
    // 🔹 GIAO DIỆN
    // ========================
    return (
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto transition-all duration-300 transform scale-100">
            {/* Nút đóng */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
                aria-label="Đóng form đăng ký"
            >
                <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {isOtpSent ? "Xác thực email" : "Đăng ký tài khoản"}
            </h2>

            {/* Thông báo */}
            {error && <p className="bg-red-100 text-red-700 p-2 rounded-lg text-sm mb-3 text-center">{error}</p>}
            {message && (
                <p className="bg-green-100 text-green-700 p-2 rounded-lg text-sm mb-3 text-center">{message}</p>
            )}

            {/* Bước 1: Nhập thông tin */}
            {!isOtpSent ? (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu (ít nhất 7 ký tự, 1 hoa, 1 ký tự đặc biệt)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />

                    <button
                        onClick={handleRequestOtp}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center ${isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Đang kiểm tra và gửi...
                            </>
                        ) : (
                            "Gửi mã xác thực"
                        )}
                    </button>
                </form>
            ) : (
                // Bước 2: Nhập mã xác thực
                <form onSubmit={handleFinalizeRegistration} className="space-y-4">
                    <p className="text-gray-600 text-sm text-center">
                        Nhập mã 6 chữ số đã được gửi tới email{" "}
                        <b className="text-indigo-600 truncate block">{email}</b>
                    </p>
                    <input
                        type="text"
                        placeholder="Nhập mã xác thực"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.slice(0, 6))} // Giới hạn 6 ký tự
                        maxLength={6}
                        required
                        className="w-full p-3 border rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center ${isLoading || otp.length !== 6
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Đang xác thực và tạo tài khoản...
                            </>
                        ) : (
                            "Xác nhận mã và Đăng ký"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="w-full text-sm text-indigo-500 hover:text-indigo-700 mt-2"
                        disabled={isLoading}
                    >
                        Quay lại chỉnh sửa thông tin
                    </button>
                </form>
            )}

            {/* Link chuyển sang đăng nhập */}
            {!isOtpSent && (
                <p className="mt-6 text-center text-sm text-gray-600">
                    Đã có tài khoản?{" "}
                    <button
                        onClick={() => onSwitchToLogin()}
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Đăng nhập
                    </button>
                </p>
            )}
        </div>
    );
};

export default RegisterPage;

"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { requestOtpForRegistration, registerWithOtp } from "../../NetWork/auth.api";

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
    // 🔹 BƯỚC 1: YÊU CẦU GỬI MÃ OTP (Chỉ gửi email)
    // ========================
    const handleRequestOtp = async () => {
        setError("");
        setMessage("");

        // Validation
        if (!fullname || !email || !password || !confirmPassword) {
            return setError("⚠️ Vui lòng điền đầy đủ thông tin trước khi gửi mã.");
        }

        if (password !== confirmPassword) {
            return setError("⚠️ Mật khẩu nhập lại không khớp!");
        }

        // Kiểm tra độ mạnh mật khẩu
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return setError(`⚠️ Mật khẩu không đủ mạnh: ${passwordErrors.join(", ")}`);
        }

        setIsLoading(true);
        try {
            // ✅ API chỉ cần email để gửi OTP
            const res = await requestOtpForRegistration(email);

            if (res.success) {
                setIsOtpSent(true);
                setMessage(res.message || "📧 Mã OTP đã được gửi tới email của bạn!");
            } else {
                setError(res.message || "❌ Không thể gửi mã OTP!");
            }
        } catch (err: any) {
            setError(err.message || "🚫 Lỗi kết nối máy chủ! Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    // ========================
    // 🔹 BƯỚC 2: XÁC THỰC OTP VÀ HOÀN TẤT ĐĂNG KÝ
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
            // ✅ API hoàn tất đăng ký với email, password và OTP
            const result = await registerWithOtp({
                email,
                password,
                otp,
            });

            if (result.success) {
                setMessage(result.message || "🎉 Đăng ký tài khoản thành công!");
                setTimeout(() => {
                    onClose();
                    onSwitchToLogin(email); // Chuyển sang login với email đã đăng ký
                }, 1500);
            } else {
                setError(result.message || "❌ Mã OTP không hợp lệ hoặc đã hết hạn.");
            }
        } catch (err: any) {
            setError(err.message || "🚫 Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    // ========================
    // 🔹 HÀM VALIDATE PASSWORD (Đồng bộ với backend)
    // ========================
    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];
        if (password.length < 8) errors.push("ít nhất 8 ký tự");
        if (!/[A-Z]/.test(password)) errors.push("có ít nhất 1 chữ hoa");
        if (!/[a-z]/.test(password)) errors.push("có ít nhất 1 chữ thường");
        if (!/[0-9]/.test(password)) errors.push("có ít nhất 1 số");
        if (!/[^A-Za-z0-9]/.test(password)) errors.push("có ít nhất 1 ký tự đặc biệt");
        return errors;
    };

    // ========================
    // 🔹 GIAO DIỆN
    // ========================
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                    aria-label="Đóng form đăng ký"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isOtpSent ? "Xác thực OTP" : "Đăng ký tài khoản"}
                </h2>

                {/* Thông báo */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {/* Bước 1: Nhập thông tin cơ bản */}
                {!isOtpSent ? (
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <input
                                type="text"
                                placeholder="Họ và tên"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Mật khẩu (8+ ký tự, hoa, thường, số, ký tự đặc biệt)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            {password && (
                                <div className="mt-1 text-xs text-gray-500">
                                    {validatePassword(password).length === 0 ? (
                                        <span className="text-green-600">✅ Mật khẩu đủ mạnh</span>
                                    ) : (
                                        <span className="text-orange-600">
                                            ⚠️ Mật khẩu cần: {validatePassword(password).join(", ")}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <div className="mt-1 text-xs text-red-600">
                                    ⚠️ Mật khẩu không khớp
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleRequestOtp}
                            disabled={isLoading || !fullname || !email || !password || !confirmPassword || password !== confirmPassword || validatePassword(password).length > 0}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center ${isLoading || !fullname || !email || !password || !confirmPassword || password !== confirmPassword || validatePassword(password).length > 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Đang gửi OTP...
                                </>
                            ) : (
                                "Gửi mã OTP"
                            )}
                        </button>
                    </form>
                ) : (
                    // Bước 2: Nhập mã OTP
                    <form onSubmit={handleFinalizeRegistration} className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm mb-2">
                                Chúng tôi đã gửi mã OTP 6 chữ số đến:
                            </p>
                            <p className="text-indigo-600 font-semibold truncate">{email}</p>
                            <p className="text-gray-500 text-xs mt-2">
                                Vui lòng kiểm tra hộp thư và nhập mã bên dưới
                            </p>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Nhập mã OTP 6 số"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtp(value);
                                }}
                                maxLength={6}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center ${isLoading || otp.length !== 6
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Đang xác thực...
                                </>
                            ) : (
                                "Xác nhận & Đăng ký"
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)}
                                className="text-sm text-indigo-500 hover:text-indigo-700 underline"
                                disabled={isLoading}
                            >
                                Quay lại chỉnh sửa thông tin
                            </button>
                        </div>
                    </form>
                )}

                {/* Link chuyển sang đăng nhập */}
                {!isOtpSent && (
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Đã có tài khoản?{" "}
                        <button
                            onClick={() => onSwitchToLogin()}
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
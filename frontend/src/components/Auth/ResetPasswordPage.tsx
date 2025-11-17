"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { resetPassword } from "../../NetWork/auth.api";

interface ResetPasswordProps {
    email: string;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordProps> = ({
    email,
    onClose,
    onSwitchToLogin,
}) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // 🔹 Validate password strength
    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];
        if (password.length < 8) errors.push("ít nhất 8 ký tự");
        if (!/[A-Z]/.test(password)) errors.push("có ít nhất 1 chữ hoa");
        if (!/[a-z]/.test(password)) errors.push("có ít nhất 1 chữ thường");
        if (!/[0-9]/.test(password)) errors.push("có ít nhất 1 số");
        if (!/[^A-Za-z0-9]/.test(password)) errors.push("có ít nhất 1 ký tự đặc biệt");
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // 🔹 Validation
        if (!password.trim() || !confirmPassword.trim()) {
            setError("Vui lòng nhập đầy đủ mật khẩu mới.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu nhập lại không khớp.");
            return;
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            setError(`Mật khẩu không đủ mạnh: ${passwordErrors.join(", ")}`);
            return;
        }

        setLoading(true);
        try {
            // ✅ Gọi API reset password với OTP đã được verify
            const result = await resetPassword({
                email,
                otp: "verified", // OTP đã được verify ở bước trước
                newPassword: password,
            });

            if (result.success) {
                setSuccess(true);
                setMessage("✅ Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");

                // ✅ Tự động chuyển về login sau 1.5 giây
                setTimeout(() => {
                    onSwitchToLogin();
                }, 1500);
            } else {
                setError(result.message || "❌ Không thể đặt lại mật khẩu. Vui lòng thử lại.");
            }
        } catch (err: any) {
            setError("🚫 Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !success) {
            onClose();
        }
    };

    const passwordErrors = validatePassword(password);
    const isFormValid =
        password.length >= 8 &&
        password === confirmPassword &&
        passwordErrors.length === 0;

    // 🔹 Hiển thị thành công
    if (success) {
        return (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={handleBackdropClick}
            >
                <div className="relative bg-white rounded-2xl w-full max-w-md p-8 shadow-xl text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h2>
                    <p className="text-green-600 mb-4">Mật khẩu đã được đặt lại thành công</p>
                    <p className="text-gray-500 text-sm">
                        Đang chuyển đến trang đăng nhập...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleBackdropClick}
        >
            <div className="relative bg-white rounded-2xl w-full max-w-md p-8 shadow-xl">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-center">Đặt lại mật khẩu</h2>
                <p className="text-gray-600 text-center mt-1 text-sm">
                    Nhập mật khẩu mới cho tài khoản: <span className="font-semibold text-indigo-600">{email}</span>
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Mật khẩu mới */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password && (
                            <div className="mt-1 text-xs">
                                {passwordErrors.length === 0 ? (
                                    <span className="text-green-600">✅ Mật khẩu đủ mạnh</span>
                                ) : (
                                    <span className="text-orange-600">
                                        ⚠️ Mật khẩu cần: {passwordErrors.join(", ")}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Nhập lại mật khẩu */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Nhập lại mật khẩu</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <div className="mt-1 text-xs text-red-600">
                                ⚠️ Mật khẩu không khớp
                            </div>
                        )}
                        {confirmPassword && password === confirmPassword && password.length >= 8 && (
                            <div className="mt-1 text-xs text-green-600">
                                ✅ Mật khẩu khớp
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Đang đặt lại...
                            </>
                        ) : (
                            "Đặt lại mật khẩu"
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm text-center">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
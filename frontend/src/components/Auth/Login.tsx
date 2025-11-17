"use client";

import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "../../NetWork/auth.api";
import { saveUserSession } from "../../utils/session";

interface LoginPageProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword: () => void;
    emailFromRegister?: string;
    onLoginSuccess?: (data: {
        token: string;
        name: string;
        email: string;
        phone?: string;
        role: string;
        id: string | number;
    }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
    onClose,
    onSwitchToRegister,
    onSwitchToForgotPassword,
    emailFromRegister,
    onLoginSuccess,
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ✅ Load email/password đã lưu nếu có
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const savedEmail = localStorage.getItem("savedEmail");
            const savedPassword = localStorage.getItem("savedPassword");
            const savedRemember = localStorage.getItem("rememberMe") === "true";

            if (savedEmail && savedPassword && savedRemember) {
                setEmail(savedEmail);
                setPassword(savedPassword);
                setRemember(true);
            }
        } catch (error) {
            console.error("❌ Lỗi khi load saved credentials:", error);
        }
    }, []);

    // ✅ Nhận email từ form đăng ký
    useEffect(() => {
        if (emailFromRegister) {
            setEmail(emailFromRegister);
            setPassword("");
            setError("");
            setMessage("");
        }
    }, [emailFromRegister]);

    // ✅ Xử lý đăng nhập
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // Validation cơ bản
        if (!email.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Email không hợp lệ.");
            return;
        }

        setIsLoading(true);

        try {
            console.log("🔄 Đang gửi yêu cầu đăng nhập...");

            const result = await login({
                email: email.trim(),
                password: password.trim()
            });

            console.log("📥 Phản hồi từ server:", result);

            if (result.success && result.data) {
                const { accessToken, user } = result.data;

                if (!accessToken || !user) {
                    throw new Error("Thiếu thông token hoặc thông tin người dùng");
                }

                // ✅ Lưu session
                const sessionData = {
                    token: accessToken,
                    name: user.name || user.email.split('@')[0],
                    email: user.email,
                    phone: user.phone || "",
                    role: user.role,
                    id: user.id,
                    avatar: user.avatar,
                };

                saveUserSession(sessionData);

                // ✅ Lưu thông tin ghi nhớ nếu được chọn
                if (typeof window !== "undefined") {
                    if (remember) {
                        localStorage.setItem("savedEmail", email);
                        localStorage.setItem("savedPassword", password);
                        localStorage.setItem("rememberMe", "true");
                    } else {
                        localStorage.removeItem("savedEmail");
                        localStorage.removeItem("savedPassword");
                        localStorage.setItem("rememberMe", "false");
                    }
                }

                // ✅ Gọi callback thành công
                if (onLoginSuccess) {
                    onLoginSuccess({
                        token: accessToken,
                        name: user.name || user.email.split('@')[0],
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        id: user.id,
                    });
                }

                setMessage(result.message || "🎉 Đăng nhập thành công!");

                // ✅ Tự động đóng sau 1.5 giây
                setTimeout(() => {
                    onClose();
                }, 1500);

            } else {
                // ❌ Xử lý lỗi từ server
                const errorMessage = result.message ||
                    result.error?.message ||
                    "Đăng nhập thất bại. Vui lòng thử lại.";
                setError(errorMessage);

                // Clear password khi có lỗi
                setPassword("");
            }
        } catch (err: any) {
            console.error("❌ Lỗi đăng nhập:", err);

            let errorMsg = "Lỗi kết nối máy chủ. Vui lòng thử lại.";

            if (err.message?.includes("Network Error") || err.message?.includes("Failed to fetch")) {
                errorMsg = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.";
            } else if (err.message) {
                errorMsg = err.message;
            }

            setError(errorMsg);
            setPassword(""); // Clear password khi có lỗi
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Xử lý nhấn phím Escape để đóng
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    // ✅ Xử lý click outside để đóng (nếu cần)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in-90 zoom-in-90">
                {/* 🔹 Nút đóng */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
                    aria-label="Đóng"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* 🔹 Tiêu đề */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Đăng nhập
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
                    </p>
                </div>

                {/* 🔹 Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="example@gmail.com"
                            autoComplete="email"
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Ghi nhớ & Quên mật khẩu */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={isLoading}
                                className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                            />
                            Ghi nhớ tài khoản
                        </label>
                        <button
                            type="button"
                            onClick={onSwitchToForgotPassword}
                            disabled={isLoading}
                            className="text-indigo-600 text-sm hover:underline transition disabled:opacity-50"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>

                    {/* Nút đăng nhập */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </form>

                {/* Thông báo */}
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

                {/* Chuyển sang đăng ký */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{" "}
                        <button
                            onClick={onSwitchToRegister}
                            disabled={isLoading}
                            className="text-indigo-600 hover:underline font-medium transition disabled:opacity-50"
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
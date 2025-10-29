"use client";

import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { login } from "../../NetWork/auth.api";
import { saveUserSession } from "../../utils/session";

interface LoginPageProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
    emailFromRegister?: string;
    onLoginSuccess?: (data: { token: string; name: string; email: string; phone?: string }) => void;

}

const LoginPage: React.FC<LoginPageProps> = ({
    onClose,
    onSwitchToRegister,
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
        const savedEmail = localStorage.getItem("savedEmail");
        const savedPassword = localStorage.getItem("savedPassword");
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRemember(true);
        }
    }, []);

    // ✅ Nhận email từ form đăng ký
    useEffect(() => {
        if (emailFromRegister) {
            setEmail(emailFromRegister);
            setPassword("");
        }
    }, [emailFromRegister]);

    // ✅ Xử lý đăng nhập
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const result = await login({ email, password });

            if (result.success) {
                const { token, user } = result.data || {};

                if (token && user) {
                    saveUserSession({
                        token,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                    });

                    if (onLoginSuccess) {
                        onLoginSuccess({
                            token,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                        });
                    }
                }

                if (typeof window !== "undefined") {
                    if (remember) {
                        localStorage.setItem("savedEmail", email);
                        localStorage.setItem("savedPassword", password);
                    } else {
                        localStorage.removeItem("savedEmail");
                        localStorage.removeItem("savedPassword");
                    }
                }

                setMessage(result.message || "🎉 Đăng nhập thành công!");
                setTimeout(() => onClose(), 1500);
            } else {
                setError(result.message || "❌ Sai thông tin đăng nhập.");
            }
        } catch (err) {
            setError("🚫 Lỗi kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            {/* 🔹 Nút đóng */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                aria-label="Đóng"
            >
                <X className="w-5 h-5" />
            </button>

            {/* 🔹 Tiêu đề */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Đăng nhập
            </h2>

            {/* 🔹 Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="example@gmail.com"
                    />
                </div>

                {/* Mật khẩu */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-xl pr-10 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Ghi nhớ */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="mr-2 w-4 h-4"
                        />
                        Ghi nhớ tài khoản
                    </label>
                    <button
                        type="button"
                        className="text-indigo-600 text-sm hover:underline"
                    >
                        Quên mật khẩu?
                    </button>
                </div>

                {/* Nút đăng nhập */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                >
                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
            </form>

            {/* Thông báo */}
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
            {message && (
                <p className="text-green-500 text-sm mt-3 text-center">{message}</p>
            )}

            {/* Chuyển sang đăng ký */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

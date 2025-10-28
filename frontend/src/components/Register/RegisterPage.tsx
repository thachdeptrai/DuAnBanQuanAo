"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { register } from "../../NetWork/auth.api";

interface RegisterPageProps {
    onClose: () => void;
    onSwitchToLogin: (email?: string) => void; // ✅ truyền email sang login
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onClose, onSwitchToLogin }) => {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("⚠️ Mật khẩu nhập lại không khớp!");
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                name: fullname,
                email,
                password,
            });

            if (result.success) {
                setMessage(result.message || "🎉 Đăng ký thành công!");
                // Tự động chuyển sang Login sau 1 giây
                setTimeout(() => {
                    onClose();
                    onSwitchToLogin(email);
                }, 1000);
            } else {
                setError(result.message || "❌ Đăng ký thất bại, vui lòng thử lại.");
            }
        } catch (err) {
            setError("🚫 Lỗi kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto">
            {/* 🔹 Nút đóng */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
                aria-label="Đóng"
            >
                <X className="w-5 h-5" />
            </button>

            {/* 🔹 Tiêu đề */}
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng ký tài khoản</h2>

            {/* 🔹 Form đăng ký */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Họ và tên */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Họ và tên
                    </label>
                    <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Mật khẩu */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Mật khẩu
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Nhập lại mật khẩu */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Nhập lại mật khẩu
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Nút đăng ký */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                >
                    {isLoading ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>

            {/* 🔹 Thông báo lỗi / thành công */}
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
            {message && <p className="text-green-500 text-sm mt-3 text-center">{message}</p>}

            {/* 🔹 Chuyển sang đăng nhập */}
            <p className="mt-6 text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <button
                    onClick={() => onSwitchToLogin()}
                    className="text-indigo-600 hover:underline font-medium"
                >
                    Đăng nhập
                </button>
            </p>
        </div>
    );
};

export default RegisterPage;

"use client";

import React, { useState } from "react";

interface RegisterPageProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onClose, onSwitchToLogin }) => {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }

        console.log("Đăng ký:", { fullname, email, password });
        onClose(); // sau khi đăng ký thành công thì đóng modal
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Họ tên */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">Họ và tên</label>
                    <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Mật khẩu */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Nhập lại mật khẩu */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Nút đăng ký */}
                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                >
                    Đăng ký
                </button>
            </form>

            {/* Chuyển sang đăng nhập */}
            <p className="mt-6 text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <button
                    onClick={onSwitchToLogin}
                    className="text-indigo-600 hover:underline font-medium"
                >
                    Đăng nhập
                </button>
            </p>
        </div>
    );
};

export default RegisterPage;

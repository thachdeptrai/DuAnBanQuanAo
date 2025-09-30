import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface LoginPageProps {
    onClose: () => void;
    onSwitchToRegister: () => void; // chuyển sang modal Đăng ký
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose, onSwitchToRegister }) => {
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        // Giả lập logic đăng nhập
        setTimeout(() => {
            setIsLoading(false);
            if (email === "test@example.com" && password === "password") {
                setMessage("Đăng nhập thành công! Đang đóng cửa sổ...");
                // Lưu email vào localStorage nếu có "Ghi nhớ"
                if (rememberMe) {
                    localStorage.setItem("savedEmail", email);
                } else {
                    localStorage.removeItem("savedEmail");
                }
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setError(
                    "Email hoặc mật khẩu không đúng. Vui lòng thử lại. (Gợi ý: test@example.com / password)"
                );
            }
        }, 1500);
    };

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative transform transition-all duration-300">
            {/* Nút đóng */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                aria-label="Đóng"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Tiêu đề */}
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
                Đăng nhập
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thông báo lỗi / thành công */}
                {error && (
                    <div
                        className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
                        role="alert"
                    >
                        {error}
                    </div>
                )}
                {message && (
                    <div
                        className="p-3 text-sm text-green-700 bg-green-100 rounded-lg"
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                {/* Input Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Địa chỉ Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={isLoading}
                    />
                </div>

                {/* Input Mật khẩu */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={isLoading}
                    />
                </div>

                {/* Ghi nhớ + Quên mật khẩu */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span>Ghi nhớ tài khoản</span>
                    </label>
                    <a
                        href="#"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Quên mật khẩu?
                    </a>
                </div>

                {/* Nút Đăng nhập */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </div>
            </form>

            {/* Chưa có tài khoản */}
            <p className="mt-6 text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Đăng ký ngay
                </button>
            </p>
        </div>
    );
};

export default LoginPage;

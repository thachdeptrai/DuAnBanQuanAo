import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
interface LoginPageProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose, onSwitchToRegister }) => {
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (email === "test@example.com" && password === "password") {
                setMessage("Đăng nhập thành công!");
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setError("Email hoặc mật khẩu không đúng. (Gợi ý: test@example.com / password)");
            }
        }, 1500);
    };

    return (
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            {/* Nút đóng */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
                <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng nhập</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl"
                >
                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
            </form>

            {/* Hiển thị lỗi/thông báo */}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            {message && <p className="text-green-500 text-sm mt-3">{message}</p>}

            {/* Switch to Register */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-indigo-600 hover:underline"
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

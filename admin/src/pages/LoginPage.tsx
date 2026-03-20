import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginApi, type LoginData, type LoginResponse } from "../api/authApi";

/* ===================== ICON COMPONENTS ===================== */
const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width={20} height={16} x={2} y={4} rx={2} />
        <path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) =>
    open ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx={12} cy={12} r={3} />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.93 21.93 0 0 1 5.06-6.94M1 1l22 22" />
        </svg>
    );

/* ===================== LOGIN PAGE ===================== */
const LoginPage: React.FC<{ setToken: React.Dispatch<React.SetStateAction<string | null>> }> = ({ setToken }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [redirecting, setRedirecting] = useState(false);

    // Load dữ liệu ghi nhớ nếu có
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("remember_email");
        const rememberedPass = localStorage.getItem("remember_password");
        if (rememberedEmail && rememberedPass) {
            setEmail(rememberedEmail);
            setPassword(rememberedPass);
            setRemember(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        setRedirecting(false);

        try {
            const data: LoginData = { email, password };
            const res: LoginResponse = await loginApi(data);

            if (res.success) {
                // Lưu token + user info
                localStorage.setItem("token", res.data.accessToken);
                localStorage.setItem("admin_user", JSON.stringify(res.data.user));

                // Set token để cập nhật state global
                setToken(res.data.accessToken);

                // Ghi nhớ tài khoản nếu check
                if (remember) {
                    localStorage.setItem("remember_email", email);
                    localStorage.setItem("remember_password", password);
                } else {
                    localStorage.removeItem("remember_email");
                    localStorage.removeItem("remember_password");
                }

                setMsg({
                    text: res.message || "Đăng nhập thành công! Đang chuyển hướng...",
                    type: "success"
                });

                setRedirecting(true);

                // Chờ 1.5s rồi chuyển hướng
                setTimeout(() => {
                    navigate("/home", { replace: true });
                }, 1500);
            } else {
                throw new Error(res.message || "Đăng nhập thất bại");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setMsg({
                text: err?.response?.data?.message || err?.message || "Email hoặc mật khẩu không đúng!",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", damping: 15 }}
                className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full border border-pink-200 backdrop-blur-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        className="text-5xl font-extrabold mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500"
                    >
                        Sweet Shop
                    </motion.h1>
                    <motion.p className="text-gray-500 text-sm sm:text-base">
                        Đăng nhập Admin
                    </motion.p>
                </div>

                {/* Message */}
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-5 text-center font-semibold p-3 rounded-xl ${msg.type === "success"
                            ? "text-green-800 bg-green-100 border border-green-300"
                            : "text-red-800 bg-red-100 border border-red-300"
                            }`}
                    >
                        {msg.text}
                        {redirecting && (
                            <div className="mt-2">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-200 shadow-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition-colors"
                                required
                                disabled={loading || redirecting}
                            />
                            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-400" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-pink-200 shadow-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition-colors"
                                required
                                disabled={loading || redirecting}
                            />
                            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-400" />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                                disabled={loading || redirecting}
                            >
                                <EyeIcon open={showPass} />
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            id="rememberMe"
                            className="h-4 w-4 text-pink-500 rounded border-gray-300 focus:ring-pink-400"
                            disabled={loading || redirecting}
                        />
                        <label htmlFor="rememberMe" className="text-gray-700 text-sm">
                            Ghi nhớ tài khoản
                        </label>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading || redirecting}
                        className={`w-full py-3 text-white font-bold rounded-xl shadow-xl transition-all ${loading || redirecting
                            ? "bg-pink-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:shadow-2xl transform hover:-translate-y-0.5"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang xử lý...
                            </span>
                        ) : redirecting ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang chuyển hướng...
                            </span>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
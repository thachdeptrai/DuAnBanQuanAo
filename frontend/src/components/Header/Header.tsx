"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import NavMenu from "./NavMenu";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoginPage from "../Login/Login";
import RegisterPage from "../Register/RegisterPage";

// Định nghĩa kiểu dữ liệu cho User
interface UserSession {
    token: string;
    name: string;
    email: string;
    phone?: string;
}

// Hàm lấy session user/token
const getUserSession = (): UserSession | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("authUser");
    try {
        return token && user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Lỗi khi phân tích JSON authUser:", error);
        return null;
    }
};

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [user, setUser] = useState<UserSession | null>(null); // Sử dụng kiểu dữ liệu đã định nghĩa

    useEffect(() => {
        const sessionUser = getUserSession();
        setUser(sessionUser);
    }, []);

    const handleUserClick = () => {
        const sessionUser = getUserSession();
        if (sessionUser) {
            // Đã đăng nhập: Chuyển hướng đến trang profile
            navigate("/profile");
        } else {
            // Chưa đăng nhập: Mở modal login
            setIsRegister(false); // mặc định mở login
            setLoginOpen(true);
        }
    };

    const handleLoginSuccess = (data: { token: string; name: string; email: string; phone?: string }) => {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data));
        // Cập nhật state user để header re-render
        setUser(data);
        setLoginOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setUser(null);
        navigate("/"); // về Home
    };
    const getLastName = (fullName: string): string => {
        const names = fullName.trim().split(/\s+/); // Tách tên bằng khoảng trắng, loại bỏ khoảng trắng dư thừa
        return names.length > 0 ? names[names.length - 1] : fullName; // Lấy phần tử cuối cùng, nếu không có tên thì trả về tên đầy đủ
    };

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-lg border-b border-white/20">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                <Logo />
                <div className="hidden md:flex flex-1 px-6">
                    <SearchBar />
                </div>
                <div className="flex items-center space-x-4">
                    {/* Icon Giỏ hàng */}
                    <Link to="/cart" className="relative p-2">
                        <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-indigo-600 transition" />
                        {/* Lưu ý: Thay số '3' tĩnh bằng số lượng sản phẩm thực tế trong giỏ hàng */}
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
                    </Link>

                    {/* Icon Yêu thích */}
                    <button className="p-2">
                        <Heart className="w-6 h-6 text-gray-700 hover:text-pink-500 transition" />
                    </button>

                    {/* Logic hiển thị Tên User hoặc Icon Đăng nhập */}
                    {/* Logic hiển thị Tên User hoặc Icon Đăng nhập */}
                    {user ? (
                        <div className="group relative">
                            <button className="flex items-center space-x-1 p-2 border border-transparent rounded-full hover:border-indigo-500 transition duration-300" onClick={handleUserClick}>
                                <User className="w-6 h-6 text-indigo-600" />
                                <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition">
                                    Xin chào, <strong style={{ fontSize: '20px' }}>{getLastName(user.name)} !</strong>  {/* SỬ DỤNG HÀM getLastName MỚI */}
                                </span>
                            </button>

                            {/* Dropdown/Menu Đăng xuất */}

                        </div>
                    ) : (
                        // Chưa đăng nhập: Hiện Icon User (click để mở form Login/Register)
                        <button className="p-2" onClick={handleUserClick}>
                            <User className="w-6 h-6 text-gray-700 hover:text-indigo-600 transition" />
                        </button>
                    )}

                    {/* Nút Menu Mobile */}
                    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:block border-t border-gray-100 bg-white/80">
                <NavMenu categories={[]} onCategoryClick={() => { }} />
            </div>

            {/* Menu Mobile */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white/90">
                    <NavMenu categories={[]} onCategoryClick={() => { }} />
                </div>
            )}

            {/* Modal Login/Register */}
            {loginOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 min-h-screen">
                    <div className="w-full max-w-md mx-auto">
                        {isRegister ? (
                            <RegisterPage
                                onClose={() => setLoginOpen(false)}
                                onSwitchToLogin={() => setIsRegister(false)}
                            />
                        ) : (
                            <LoginPage
                                onClose={() => setLoginOpen(false)}
                                onSwitchToRegister={() => setIsRegister(true)}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
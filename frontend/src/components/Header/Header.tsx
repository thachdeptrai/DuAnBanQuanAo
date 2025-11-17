"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, User, Menu, X, LogOut, Home, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import NavMenu from "./NavMenu";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoginPage from "../Auth/Login";
import RegisterPage from "../Auth/RegisterPage";
import ForgotPasswordPage from "../Auth/ForgotPasswordPage"; // ✅ Thêm import
import ResetPasswordPage from "../Auth/ResetPasswordPage"; // ✅ Thêm import

import { getUserSession, saveUserSession, clearUserSession, type UserSession } from "../../utils/session";

interface NavIconProps {
    to: string;
    Icon: React.ElementType;
    label: string;
    badgeCount?: number;
    title: string;
}

const NavIcon: React.FC<NavIconProps> = ({ to, Icon, label, badgeCount, title }) => (
    <Link
        to={to}
        className="relative flex flex-col items-center p-2 group hover:text-indigo-600 transition-all"
        title={title}
    >
        <Icon className="w-6 h-6 mb-0.5 text-gray-700 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-gray-500 group-hover:text-indigo-600 hidden sm:inline">
            {label}
        </span>
        {badgeCount && badgeCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center transform translate-x-1/4 -translate-y-1/4">
                {badgeCount}
            </span>
        )}
    </Link>
);

// ✅ Định nghĩa type cho auth modal
type AuthModalType = "login" | "register" | "forgotPassword" | "resetPassword" | null;

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [authModal, setAuthModal] = useState<AuthModalType>(null); // ✅ Dùng 1 state cho tất cả modal
    const [user, setUser] = useState<UserSession | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [emailForReset, setEmailForReset] = useState<string>(""); // ✅ Email cho reset password

    useEffect(() => {
        setUser(getUserSession());
    }, []);

    const toggleDropdown = () => setDropdownOpen(prev => !prev);

    const handleUserClick = () => {
        const current = getUserSession();
        if (current) toggleDropdown();
        else {
            setAuthModal("login");
        }
    };

    const handleProfileClick = () => {
        navigate("/profile");
        setDropdownOpen(false);
    };

    const handleLoginSuccess = (data: { token: string; name: string; email: string; phone?: string; role: string; id: string | number }) => {
        const sessionData: UserSession = {
            ...data,
            role: (data.role === "customer" || data.role === "admin" ? data.role : "customer") as "customer" | "admin"
        };
        saveUserSession(sessionData);
        setUser(sessionData);
        setAuthModal(null); // ✅ Đóng modal sau khi login thành công
        setDropdownOpen(false);
    };

    // ✅ Hàm chuyển đổi giữa các modal
    const handleSwitchToRegister = () => setAuthModal("register");
    const handleSwitchToLogin = (email?: string) => setAuthModal("login");
    const handleSwitchToForgotPassword = () => setAuthModal("forgotPassword");
    const handleSwitchToResetPassword = (email: string) => {
        setEmailForReset(email);
        setAuthModal("resetPassword");
    };

    const handleCloseAuthModal = () => {
        setAuthModal(null);
        setEmailForReset("");
    };

    const handleLogout = async () => {
        setLogoutModalOpen(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            clearUserSession();
            setUser(null);
            setDropdownOpen(false);
            navigate("/");
        } catch (error) {
            console.error(error);
        } finally {
            setLogoutModalOpen(false);
        }
    };

    const getLastName = (fullName: string) =>
        fullName.trim().split(/\s+/).slice(-1)[0] || fullName;

    // ✅ Render auth modal dựa trên state
    const renderAuthModal = () => {
        if (!authModal) return null;

        const handleBackdropClick = (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                handleCloseAuthModal();
            }
        };

        return (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={handleBackdropClick}
            >
                <div onClick={(e) => e.stopPropagation()}>
                    {authModal === "login" && (
                        <LoginPage
                            onClose={handleCloseAuthModal}
                            onSwitchToRegister={handleSwitchToRegister}
                            onSwitchToForgotPassword={handleSwitchToForgotPassword}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    )}
                    {authModal === "register" && (
                        <RegisterPage
                            onClose={handleCloseAuthModal}
                            onSwitchToLogin={handleSwitchToLogin}
                        />
                    )}
                    {authModal === "forgotPassword" && (
                        <ForgotPasswordPage
                            onClose={handleCloseAuthModal}
                            onSwitchToLogin={handleSwitchToLogin} // ✅ Thay đổi từ onSwitchToReset
                        />
                    )}
                    {authModal === "resetPassword" && emailForReset && (
                        <ResetPasswordPage
                            email={emailForReset}
                            onClose={handleCloseAuthModal}
                            onSwitchToLogin={handleSwitchToLogin}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
            <div className="container mx-auto flex items-center justify-between py-3 px-4 sm:px-6">
                <Link to="/" className="flex items-center p-1">
                    <Logo />
                </Link>

                <div className="hidden md:flex flex-1 max-w-lg mx-6">
                    <SearchBar />
                </div>

                <div className="flex items-end space-x-3 sm:space-x-5">
                    <NavIcon to="/" Icon={Home} label="Trang Chủ" title="Về trang chủ" />
                    <NavIcon to="/wishlist" Icon={Heart} label="Yêu Thích" title="Sản phẩm yêu thích" />
                    <NavIcon to="/cart" Icon={ShoppingCart} label="Giỏ Hàng" badgeCount={3} title="Xem giỏ hàng" />

                    {user ? (
                        <div className="relative flex flex-col items-center">
                            <button
                                className="flex flex-col items-center p-2 group hover:text-indigo-600"
                                onClick={handleUserClick}
                                title="Quản lý tài khoản"
                            >
                                <User className="w-6 h-6 mb-0.5 text-indigo-600 group-hover:text-indigo-700 transition" />
                                <span className="text-xs font-medium text-gray-700 hidden sm:inline group-hover:text-indigo-700">
                                    {getLastName(user.name)}
                                </span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <button
                                        onClick={handleProfileClick}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4" /> Xem Profile
                                    </button>
                                    <hr className="border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> đăng xuất
                                        <div className="ml-auto animate-pulse text-xs font-medium text-red-600">
                                            !
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleUserClick}
                            title="Đăng nhập / Đăng ký"
                            className="flex flex-col items-center p-2 group hover:text-indigo-600"
                        >
                            <User className="w-6 h-6 mb-0.5 text-gray-700 group-hover:text-indigo-600 transition" />
                            <span className="text-xs font-medium text-gray-500 hidden sm:inline group-hover:text-indigo-600">
                                Đăng Nhập
                            </span>
                        </button>
                    )}

                    <button
                        className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div className="hidden md:block bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6">
                    <NavMenu categories={[]} onCategoryClick={() => { }} />
                </div>
            </div>

            {menuOpen && (
                <div className="md:hidden absolute w-full left-0 bg-white shadow-lg border-t border-gray-200 z-40">
                    <div className="p-4 border-b border-gray-100">
                        <SearchBar />
                    </div>
                    <NavMenu categories={[]} onCategoryClick={() => setMenuOpen(false)} />
                </div>
            )}

            {/* ✅ Render auth modal */}
            {renderAuthModal()}

            {/* --- Modal Logout --- */}
            {logoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 mb-4 animate-spin text-red-600" />
                        <span className="text-lg font-semibold text-gray-800">Đang đăng xuất...</span>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
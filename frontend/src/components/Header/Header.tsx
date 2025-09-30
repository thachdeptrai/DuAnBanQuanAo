import React, { useState } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import NavMenu from "./NavMenu";
import LoginPage from "../Login/Login";
import RegisterPage from "../Register/RegisterPage";
import Cart from "../Cart/Cart"; // Import component Cart/Cart
import { Heart, Menu, ShoppingCart, User, X } from "lucide-react";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    // Mở Login Modal
    const handleOpenLogin = () => {
        setAuthMode("login");
        setIsLoginModalOpen(true);
    };

    // Đóng Login Modal
    const handleCloseLogin = () => {
        setIsLoginModalOpen(false);
    };

    // Mở Cart Modal
    const handleOpenCart = () => {
        setIsCartModalOpen(true);
    };

    // Đóng Cart Modal
    const handleCloseCart = () => {
        setIsCartModalOpen(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-lg border-b border-white/20">
                <div className="container mx-auto flex items-center justify-between py-4 px-6">
                    <Logo />

                    <div className="hidden md:flex flex-1 px-6">
                        <SearchBar />
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Nút mở Cart Modal */}
                        <button className="relative p-2 rounded-full hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all group"
                            onClick={handleOpenCart}>
                            <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                            <span className="absolute -top-1 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                                3
                            </span>
                        </button>

                        <button className="p-2 rounded-full hover:bg-gradient-to-br hover:from-pink-50 hover:to-red-50 transition-all group">
                            <Heart className="w-6 h-6 text-gray-700 group-hover:text-pink-500 group-hover:scale-110 transition-all" />
                        </button>

                        {/* Nút mở modal login */}
                        <button
                            onClick={handleOpenLogin}
                            className="p-2 rounded-full hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all group"
                        >
                            <User className="w-6 h-6 text-gray-700 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                        </button>

                        <button
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <div className="hidden md:block border-t border-gray-100 bg-white/80 backdrop-blur-md">
                    <NavMenu />
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-md">
                        <NavMenu />
                    </div>
                )}
            </header>

            {/* Modal Auth */}
            {isLoginModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={handleCloseLogin}
                >
                    <div
                        className="relative w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Nút X đóng Modal Auth */}
                        <button
                            onClick={handleCloseLogin}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition z-10 p-2 bg-white rounded-full shadow-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {authMode === "login" ? (
                            <LoginPage
                                onClose={handleCloseLogin}
                                onSwitchToRegister={() => setAuthMode("register")}
                            />
                        ) : (
                            <RegisterPage
                                onClose={handleCloseLogin}
                                onSwitchToLogin={() => setAuthMode("login")}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Modal Giỏ Hàng (Cart Modal) */}
            {isCartModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-sm"
                    onClick={handleCloseCart}
                >
                    <div
                        className="relative w-full max-w-sm bg-white h-screen overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-out translate-x-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Nút đóng Cart Modal */}
                        <div className="p-4 flex justify-between items-center border-b">
                            <h2 className="text-xl font-bold text-gray-800">Giỏ Hàng Của Bạn</h2>
                            <button
                                onClick={handleCloseCart}
                                className="text-gray-500 hover:text-red-500 transition p-2 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Component Cart được nhúng vào Modal */}
                        {/* 🌟 SỬA LỖI: Đổi tên prop từ 'onClose' sang 'onCloseCart' */}
                        <Cart onCloseCart={handleCloseCart} />

                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
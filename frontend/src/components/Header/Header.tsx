import React, { useState } from "react";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import NavMenu from "./NavMenu";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoginPage from "../Login/Login";
import RegisterPage from "../Register/RegisterPage";

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-lg border-b border-white/20">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo */}
                <Logo />

                {/* Search (Desktop only) */}
                <div className="hidden md:flex flex-1 px-6">
                    <SearchBar />
                </div>

                {/* Icons */}
                <div className="flex items-center space-x-4">
                    {/* Cart */}
                    <Link to="/cart" className="relative p-2">
                        <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-indigo-600 transition" />
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            3
                        </span>
                    </Link>

                    {/* Wishlist */}
                    <button className="p-2">
                        <Heart className="w-6 h-6 text-gray-700 hover:text-pink-500 transition" />
                    </button>

                    {/* User */}
                    <button
                        className="p-2"
                        onClick={() => {
                            setIsRegister(false); // mặc định mở Login
                            setLoginOpen(true);
                        }}
                    >
                        <User className="w-6 h-6 text-gray-700 hover:text-indigo-600 transition" />
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block border-t border-gray-100 bg-white/80">
                <NavMenu categories={[]} onCategoryClick={() => { }} />
            </div>

            {/* Mobile Nav */}
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
                            />
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

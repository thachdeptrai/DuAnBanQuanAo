import React, { useState } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import NavMenu from "./NavMenu";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
const Header = ({ categories, onSearch, onCategoryClick, cartCount }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    
    return (
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Logo />
          
          <div className="hidden md:flex flex-1 px-6">
            <SearchBar onSearch={onSearch} />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-full hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all group">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-gradient-to-br hover:from-pink-50 hover:to-red-50 transition-all group">
              <Heart className="w-6 h-6 text-gray-700 group-hover:text-pink-500 group-hover:scale-110 transition-all" />
            </button>
            <button className="p-2 rounded-full hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all group">
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
          <NavMenu categories={categories} onCategoryClick={onCategoryClick} />
        </div>
        
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-md">
            <NavMenu categories={categories} onCategoryClick={onCategoryClick} />
          </div>
        )}
      </header>
    );
  };
export default Header;

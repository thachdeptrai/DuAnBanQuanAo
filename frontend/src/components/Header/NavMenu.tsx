import { Gift, Zap } from 'lucide-react';
import React from 'react';
const NavMenu = () => {
    const menuItems = [
        { name: "Mới Nhất", icon: Zap },
        { name: "Nam", icon: null },
        { name: "Nữ", icon: null },
        { name: "Trẻ Em", icon: null },
        { name: "Phụ Kiện", icon: null },
        { name: "Sale Off", icon: Gift }
    ];
    return (
        <nav className="container mx-auto px-6 py-3">
            <ul className="flex items-center justify-center space-x-8">
                {menuItems.map((item, index) => (
                    <li key={index}>
                        <button className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium transition-all hover:scale-110 group">
                            {item.icon && <item.icon className="w-4 h-4 group-hover:animate-pulse" />}
                            <span>{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
export default NavMenu;

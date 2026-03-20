import React from 'react';
import { Search, Bell, User, MessageSquare, Home, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// Khai báo kiểu chung cho Icon Component
interface IconProps {
    className?: string;
    size?: string | number;
}

// Giả định LogoComponent
const LogoComponent: React.FC = () => (
    <Link to="/home" className="text-xl font-bold text-cyan-600 flex items-center">
        <Zap className="w-6 h-6 mr-2" />
        MyAdmin
    </Link>
);

// Component Icon chức năng
interface NavIconProps {
    Icon: React.ElementType<IconProps>;
    label: string;
    to?: string;
    onClick?: () => void;
    notificationCount?: number;
}

const NavIcon: React.FC<NavIconProps> = ({ Icon, label, to, onClick, notificationCount }) => {
    if (to) {
        return (
            <Link
                to={to}
                aria-label={label}
                className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition duration-150 ease-in-out group"
            >
                <Icon className="h-6 w-6 text-gray-500 group-hover:text-cyan-600" />
                {notificationCount && notificationCount > 0 && (
                    <span className="absolute top-0 right-0 block px-1 text-center h-4 min-w-4 rounded-full ring-2 ring-white bg-red-500 text-xs text-white font-medium -mt-1 -mr-1">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition duration-150 ease-in-out group"
        >
            <Icon className="h-6 w-6 text-gray-500 group-hover:text-cyan-600" />
            {notificationCount && notificationCount > 0 && (
                <span className="absolute top-0 right-0 block px-1 text-center h-4 min-w-4 rounded-full ring-2 ring-white bg-red-500 text-xs text-white font-medium -mt-1 -mr-1">
                    {notificationCount > 99 ? '99+' : notificationCount}
                </span>
            )}
        </button>
    );
};

const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleSearchClick = () => {
        console.log('Mở tìm kiếm');
        // Có thể thêm logic mở modal/search box ở đây
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 1. Logo (Bên trái) */}
                    <div className="flex-shrink-0">
                        <LogoComponent />
                    </div>

                    {/* 2. Các Icon Chức năng (Bên phải) */}
                    <nav className="flex items-center space-x-2 sm:space-x-4">
                        {/* Trang Chủ (Home) */}
                        <NavIcon
                            Icon={Home}
                            label="Trang chủ"
                            to="/"
                        />

                        {/* Tìm kiếm */}
                        <NavIcon
                            Icon={Search}
                            label="Tìm kiếm"
                            onClick={handleSearchClick}
                        />

                        {/* Thông báo */}
                        <NavIcon
                            Icon={Bell}
                            label="Thông báo"
                            to="/notifications"
                            notificationCount={5}
                        />

                        {/* Tin nhắn từ khách hàng */}
                        <NavIcon
                            Icon={MessageSquare}
                            label="Tin nhắn từ khách hàng"
                            to="/messages"
                            notificationCount={2}
                        />

                        {/* Profile/Tài khoản */}
                        <div className="relative ml-4">
                            <button
                                onClick={handleProfileClick}
                                className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-cyan-500 transition duration-150 ease-in-out hover:border-cyan-300"
                                aria-label="Menu tài khoản người dùng"
                            >
                                <span className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold hover:bg-cyan-200 transition duration-150">
                                    <User className="h-5 w-5" />
                                </span>
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
import React from 'react';
import {
    Home,
    ShoppingCart,
    Box,
    Megaphone,
    Users,
    Video,
    Clock,
    BarChart3,
    Shield,
    Wallet,
    GraduationCap
} from 'lucide-react'; // Sử dụng icon từ thư viện lucide-react

// Định nghĩa cấu trúc cho một mục menu
interface NavItem {
    id: number;
    label: string;
    icon: React.ElementType; // Kiểu cho component icon
    link: string;
}

// Dữ liệu menu tương ứng với ảnh mẫu
const menuItems: NavItem[] = [
    { id: 1, label: 'Trang chủ', icon: Home, link: '/home' },
    { id: 2, label: 'Đơn hàng', icon: ShoppingCart, link: '/orders' },
    { id: 3, label: 'Sản phẩm', icon: Box, link: '/products' },
];

const marketingItems: NavItem[] = [
    { id: 4, label: 'Marketing', icon: Megaphone, link: '/marketing' },
    { id: 5, label: 'Liên kết', icon: Users, link: '/affiliate' },
    { id: 6, label: 'LIVE và video', icon: Video, link: '/live-video' },
    { id: 7, label: 'Phát triển', icon: Clock, link: '/growth' }, // Thay thế icon đồng hồ thành Clock
];

const dataItems: NavItem[] = [
    { id: 8, label: 'La bàn dữ liệu', icon: BarChart3, link: '/data-compass' },
    { id: 9, label: 'Tình trạng tài khoản', icon: Shield, link: '/account-status' }, // Thay thế icon thành Shield
    { id: 10, label: 'Tài chính', icon: Wallet, link: '/finance' },
];

const academyItem: NavItem[] = [
    { id: 11, label: 'Học viện', icon: GraduationCap, link: '/academy' },
];

// Component cho từng mục Menu Item
interface MenuItemProps {
    item: NavItem;
    isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive }) => {
    // Màu nhấn (Accent Color) - sử dụng màu xanh ngọc/cyan để đồng bộ
    const accentColor = 'text-cyan-500';
    const hoverBgColor = 'hover:bg-gray-100';

    return (
        <a
            href={item.link}
            className={`
        flex items-center px-4 py-3 text-sm font-medium transition duration-150 ease-in-out
        ${isActive ? `bg-cyan-50 ${accentColor} border-r-4 border-cyan-500` : `text-gray-700 ${hoverBgColor}`}
        ${isActive ? '' : 'cursor-pointer'}
      `}
        >
            <item.icon
                className={`w-5 h-5 mr-3 ${isActive ? accentColor : 'text-gray-500'}`}
                strokeWidth={1.5} // Icon trong mẫu có vẻ mảnh hơn
            />
            <span>{item.label}</span>
        </a>
    );
};

// Component chính Sidebar
interface SidebarProps {
    // Giả định mục Trang chủ là mục active hiện tại
    activeLink: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLink }) => {

    // Hàm render một nhóm menu
    const renderGroup = (group: NavItem[], showDivider: boolean = true) => (
        <div className={`py-2 ${showDivider ? 'border-b border-gray-200' : ''}`}>
            {group.map((item) => (
                <MenuItem
                    key={item.id}
                    item={item}
                    isActive={item.link === activeLink}
                />
            ))}
        </div>
    );

    return (
        // Sidebar cố định bên trái, nền trắng, chiều rộng 64 (16rem/256px)
        <div className="w-64 h-screen bg-white shadow-xl flex-shrink-0">

            {/* ⚠️ Lưu ý: Trong một ứng dụng thực tế, bạn sẽ cần xử lý phần header/logo 
         để nó không bị scroll cùng với sidebar, hoặc bạn có thể đặt Sidebar 
         nằm dưới Header nếu Header cố định (như component trước). 
         
         Tôi sẽ để trống khoảng không cho Header để khớp với ảnh mẫu nếu cần */}

            <div className="pt-2"> {/* Padding top để bắt đầu menu */}

                {/* Nhóm 1: Cơ bản */}
                {renderGroup(menuItems)}

                {/* Nhóm 2: Marketing và Phát triển */}
                {renderGroup(marketingItems)}

                {/* Nhóm 3: Dữ liệu và Tài chính */}
                {renderGroup(dataItems)}

                {/* Nhóm 4: Học viện (Không có divider phía dưới) */}
                {renderGroup(academyItem, false)}

            </div>
        </div>
    );
};

export default Sidebar;
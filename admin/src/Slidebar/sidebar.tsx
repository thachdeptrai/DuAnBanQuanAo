import React from 'react';
import {
    Home,
    ShoppingCart,
    Package,
    Megaphone,
    Users,
    Video,
    Clock,
    BarChart3,
    Shield,
    Wallet,
    GraduationCap,
    FolderOpen,
    Tag // Thêm icon Tag cho Brand
} from 'lucide-react';

// Định nghĩa cấu trúc cho một mục menu
interface NavItem {
    id: number;
    label: string;
    icon: React.ElementType;
    link: string;
}

// Dữ liệu menu
const menuItems: NavItem[] = [
    { id: 1, label: 'Trang chủ', icon: Home, link: '/home' },
    { id: 2, label: 'Đơn hàng', icon: ShoppingCart, link: '/orders' },
    { id: 3, label: 'Sản phẩm', icon: Package, link: '/products' },
    { id: 4, label: 'Danh mục', icon: FolderOpen, link: '/categories' },
    { id: 5, label: 'Thương hiệu', icon: Tag, link: '/brand-management' }, // Sử dụng icon Tag cho Brand
];

const marketingItems: NavItem[] = [
    { id: 6, label: 'Marketing', icon: Megaphone, link: '/marketing' },
    // Thêm mục Quản lí Người dùng vào đây
    { id: 7, label: 'Quản lí Người dùng', icon: Users, link: '/user-management' },
    { id: 8, label: 'Liên kết', icon: Users, link: '/affiliate' },
    { id: 9, label: 'LIVE và video', icon: Video, link: '/live-video' },
    { id: 10, label: 'Phát triển', icon: Clock, link: '/growth' },
];

const dataItems: NavItem[] = [
    { id: 11, label: 'La bàn dữ liệu', icon: BarChart3, link: '/data-compass' },
    { id: 12, label: 'Tình trạng tài khoản', icon: Shield, link: '/account-status' },
    { id: 13, label: 'Tài chính', icon: Wallet, link: '/finance' },
];

const academyItem: NavItem[] = [
    { id: 14, label: 'Học viện', icon: GraduationCap, link: '/academy' },
];

// Component cho từng mục Menu Item
interface MenuItemProps {
    item: NavItem;
    isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive }) => {
    const IconComponent = item.icon;
    const accentColor = 'text-cyan-500';
    const hoverBgColor = 'hover:bg-gray-100';

    return (
        <a
            href={item.link}
            className={`
                flex items-center px-4 py-3 text-sm font-medium transition duration-150 ease-in-out
                ${isActive
                    ? `bg-cyan-50 ${accentColor} border-r-4 border-cyan-500`
                    : `text-gray-700 ${hoverBgColor}`
                }
            `}
        >
            <IconComponent
                className={`w-5 h-5 mr-3 ${isActive ? accentColor : 'text-gray-500'}`}
                strokeWidth={1.5}
            />
            <span>{item.label}</span>
        </a>
    );
};

// Component chính Sidebar
interface SidebarProps {
    activeLink: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLink }) => {
    const renderGroup = (group: NavItem[], showDivider: boolean = true) => (
        <div className={`py-2 ${showDivider ? 'border-b border-gray-200' : ''}`}>
            {group.map((item) => (
                <MenuItem
                    key={item.id}
                    item={item}
                    isActive={activeLink.startsWith(item.link)}
                />
            ))}
        </div>
    );

    return (
        <div
            className="
                w-64
                bg-white
                shadow-xl
                flex-shrink-0
                max-h-[calc(100vh-64px)]
                overflow-y-auto
                overflow-x-hidden
                sticky top-[64px]
            "
        >
            <div className="pt-2">
                {renderGroup(menuItems)}
                {renderGroup(marketingItems)}
                {renderGroup(dataItems)}
                {renderGroup(academyItem, false)}
            </div>
        </div>
    );
};

export default Sidebar;
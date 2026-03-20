import React from 'react';
import { useNavigate } from "react-router-dom";
import { ShoppingBag, DollarSign, Repeat2, Zap, Clock } from 'lucide-react';

// Định nghĩa cấu trúc cho chỉ số thống kê
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan';
}

// Component hiển thị một chỉ số thống kê
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        green: 'bg-green-50 text-green-700 border-green-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };

    const valueColor = {
        green: 'text-green-900',
        blue: 'text-blue-900',
        yellow: 'text-yellow-900',
        red: 'text-red-900',
        purple: 'text-purple-900',
        cyan: 'text-cyan-900',
    };

    return (
        <div className={`p-5 rounded-xl shadow-md border ${colorClasses[color]} flex items-center justify-between transition-all duration-300 hover:shadow-lg`}>
            <div>
                <p className={`text-sm font-medium ${colorClasses[color]}`}>{title}</p>
                <p className={`text-3xl font-bold mt-1 ${valueColor[color]}`}>{value}</p>
            </div>
            <Icon className={`w-8 h-8 opacity-50 ${colorClasses[color]}`} strokeWidth={1.5} />
        </div>
    );
};

// Dữ liệu thống kê
const fashionStats: StatCardProps[] = [
    { title: 'Doanh thu Thuần (7 ngày)', value: '$15,400', icon: DollarSign, color: 'green' },
    { title: 'Đơn hàng Mới (Hôm nay)', value: '45', icon: ShoppingBag, color: 'blue' },
    { title: 'Khách hàng Quay lại', value: '35%', icon: Repeat2, color: 'purple' },
    { title: 'Sản phẩm Bán chạy nhất', value: 'Áo Thun Basic', icon: Zap, color: 'red' },
    { title: 'Giá trị Đơn hàng TB (AOV)', value: '$65.50', icon: DollarSign, color: 'yellow' },
    { title: 'Tồn kho cảnh báo', value: '12 SKU', icon: Clock, color: 'cyan' },
];

const DashboardContent: React.FC = () => {
    const navigate = useNavigate();
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}") as { name?: string };
        } catch {
            return {};
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-full min-h-full bg-gray-50">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-3xl font-extrabold text-cyan-600 mb-2">
                    Xin chào, {user.name || "Admin"}!
                </h1>
                <p className="text-gray-500 mb-6 border-b pb-4">
                    Tổng quan hiệu suất kinh doanh thời trang của bạn.
                </p>

                {/* Khu vực Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {fashionStats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Khu vực Biểu đồ/Danh sách gần đây */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Biểu đồ Doanh thu */}
                    <div className="lg:col-span-2 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Biểu đồ Doanh thu (30 ngày)</h2>
                        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            [Chỗ này sẽ nhúng Biểu đồ]
                        </div>
                    </div>

                    {/* Đơn hàng cần xử lý */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Đơn hàng cần xử lý</h2>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex justify-between p-2 bg-white rounded shadow-sm">
                                <span>#ORD1234</span>
                                <span className="font-semibold">$89.00</span>
                            </li>
                            <li className="flex justify-between p-2 bg-white rounded shadow-sm">
                                <span>#ORD1235</span>
                                <span className="font-semibold">$45.50</span>
                            </li>
                            <li className="flex justify-between p-2 bg-white rounded shadow-sm">
                                <span>#ORD1236</span>
                                <span className="font-semibold">$120.00</span>
                            </li>
                        </ul>
                        <button className="w-full mt-4 text-cyan-600 hover:text-cyan-800 text-sm font-medium transition-colors">
                            Xem tất cả
                        </button>
                    </div>
                </div>

                {/* Nút Đăng xuất */}
                <button
                    onClick={handleLogout}
                    className="mt-8 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 shadow-md focus:outline-none focus:ring-4 focus:ring-red-300 active:scale-95"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default DashboardContent;
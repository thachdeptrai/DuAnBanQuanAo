// ProfileUser.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Shield, ShoppingBag,
    Package, CreditCard, Clock, CheckCircle, XCircle, Search,
    Download, Filter, ArrowLeft, Edit, Map, Smartphone,
    CreditCard as CardIcon, Truck, CheckSquare, AlertCircle
} from 'lucide-react';
import { getUserByIdApi, type User as UserType } from '../api/authApi';
import { useParams, useNavigate } from 'react-router-dom';

// =========================================================
// 🎯 TYPES & INTERFACES
// =========================================================

interface Order {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    totalAmount: number;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
    shippingAddress: string;
    paymentMethod: string;
    products: OrderProduct[];
}

interface OrderProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    total: number;
}

// =========================================================
// 🔹 UTILITY FUNCTIONS
// =========================================================

const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'N/A';
    }
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const getStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Chờ xác nhận' },
        confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, text: 'Đã xác nhận' },
        shipping: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, text: 'Đang giao hàng' },
        delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckSquare, text: 'Đã giao' },
        cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Đã hủy' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
            <IconComponent className="w-4 h-4 mr-1" />
            {config.text}
        </span>
    );
};

// =========================================================
// 🔹 COMPONENTS PHỤ TRỢ
// =========================================================

interface OrderCardProps {
    order: Order;
    onViewDetail: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetail }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Đơn hàng #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                {getStatusBadge(order.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-lg font-semibold text-gray-800">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Số sản phẩm</p>
                    <p className="text-lg font-semibold text-gray-800">{order.itemCount} sản phẩm</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Phương thức</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center">
                        <CreditCard className="w-4 h-4 mr-1" />
                        {order.paymentMethod}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Cập nhật</p>
                    <p className="text-sm text-gray-800">{formatDate(order.updatedAt)}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{order.shippingAddress}</span>
                    </p>
                </div>
                <button
                    onClick={() => onViewDetail(order)}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Chi tiết Đơn hàng</h2>
                            <p className="text-blue-100 mt-1">#{order.orderNumber}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Thông tin đơn hàng */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <ShoppingBag className="w-5 h-5 mr-2 text-blue-500" />
                                Thông tin Đơn hàng
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đơn hàng:</span>
                                    <span className="font-semibold">#{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng tiền:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số sản phẩm:</span>
                                    <span className="font-semibold">{order.itemCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin giao hàng */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <Truck className="w-5 h-5 mr-2 text-green-500" />
                                Thông tin Giao hàng
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phương thức TT:</span>
                                    <span className="font-semibold">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span className="font-semibold">{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cập nhật:</span>
                                    <span className="font-semibold">{formatDate(order.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Địa chỉ giao hàng */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-red-500" />
                            Địa chỉ Giao hàng
                        </h3>
                        <p className="text-gray-700">{order.shippingAddress}</p>
                    </div>

                    {/* Sản phẩm */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm trong đơn</h3>
                        <div className="space-y-3">
                            {order.products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            <p className="text-sm text-gray-600">{formatCurrency(product.price)} x {product.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-gray-800">{formatCurrency(product.total)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// 🥇 COMPONENT CHÍNH: ProfileUser
// =========================================================

const ProfileUser: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserType | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // 🎯 Mock data for orders (sau này sẽ thay bằng API call)
    const mockOrders: Order[] = [
        {
            id: '1',
            orderNumber: 'DH2024120001',
            status: 'delivered',
            totalAmount: 1250000,
            itemCount: 3,
            createdAt: '2024-12-01T10:00:00Z',
            updatedAt: '2024-12-03T15:30:00Z',
            shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
            paymentMethod: 'Chuyển khoản',
            products: [
                { id: '1', name: 'Bánh ngọt hương vani', price: 150000, quantity: 2, image: '', total: 300000 },
                { id: '2', name: 'Bánh kem socola', price: 350000, quantity: 1, image: '', total: 350000 },
                { id: '3', name: 'Set bánh mix 5 loại', price: 600000, quantity: 1, image: '', total: 600000 }
            ]
        },
        {
            id: '2',
            orderNumber: 'DH2024120002',
            status: 'shipping',
            totalAmount: 780000,
            itemCount: 2,
            createdAt: '2024-12-02T14:20:00Z',
            updatedAt: '2024-12-02T16:45:00Z',
            shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM',
            paymentMethod: 'Tiền mặt',
            products: [
                { id: '4', name: 'Bánh mì ngọt', price: 25000, quantity: 12, image: '', total: 300000 },
                { id: '5', name: 'Bánh su kem', price: 480000, quantity: 1, image: '', total: 480000 }
            ]
        },
        {
            id: '3',
            orderNumber: 'DH2024120003',
            status: 'pending',
            totalAmount: 420000,
            itemCount: 1,
            createdAt: '2024-12-03T09:15:00Z',
            updatedAt: '2024-12-03T09:15:00Z',
            shippingAddress: '789 Đường DEF, Quận 5, TP.HCM',
            paymentMethod: 'Chuyển khoản',
            products: [
                { id: '6', name: 'Bánh tart trứng', price: 420000, quantity: 1, image: '', total: 420000 }
            ]
        }
    ];

    const fetchUserData = useCallback(async () => {
        if (!userId) {
            setError('Không tìm thấy ID người dùng');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 🎯 Fetch user data
            const userResponse = await getUserByIdApi(userId);
            if (userResponse.success) {
                setUser(userResponse.data);

                // 🎯 Mock: Set orders data (sau này sẽ fetch từ API riêng)
                setOrders(mockOrders);
            } else {
                throw new Error(userResponse.message || 'Không thể tải thông tin người dùng');
            }
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const handleViewOrderDetail = (order: Order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Đang tải thông tin người dùng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleBack}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy người dùng</h2>
                    <button
                        onClick={handleBack}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Hồ sơ Người dùng</h1>
                            <p className="text-gray-600 mt-1">Thông tin chi tiết và lịch sử đơn hàng</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Thông tin người dùng */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
                            {/* Avatar & Basic Info */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{safeString(user.name) || 'Chưa đặt tên'}</h2>
                                <p className="text-gray-600 mt-1 flex items-center justify-center">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {safeString(user.email)}
                                </p>
                                <div className="flex justify-center mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        <Shield className="w-4 h-4 mr-1" />
                                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-500" />
                                        Thông tin Liên hệ
                                    </h3>
                                    <div className="space-y-3">
                                        {user.phone && (
                                            <div className="flex items-center text-gray-700">
                                                <Smartphone className="w-4 h-4 mr-3 text-green-500" />
                                                <span>{safeString(user.phone)}</span>
                                            </div>
                                        )}
                                        {user.address && (
                                            <div className="flex items-start text-gray-700">
                                                <Map className="w-4 h-4 mr-3 text-red-500 mt-0.5 flex-shrink-0" />
                                                <span>{safeString(user.address)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <Shield className="w-5 h-5 mr-2 text-purple-500" />
                                        Thông tin Tài khoản
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`font-semibold ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {user.status === 'active' ? '✅ Hoạt động' : '❌ Đã cấm'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Xác thực email:</span>
                                            <span className={`font-semibold ${user.email_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {user.email_verified ? '✅ Đã xác thực' : '⏳ Chưa xác thực'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày tạo:</span>
                                            <span className="font-semibold">{formatDate(user.created_at)}</span>
                                        </div>
                                        {user.updated_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Cập nhật cuối:</span>
                                                <span className="font-semibold">{formatDate(user.updated_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Lịch sử đơn hàng */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                            {/* Orders Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <ShoppingBag className="w-6 h-6 mr-3 text-blue-500" />
                                        Lịch sử Đơn hàng
                                    </h2>
                                    <p className="text-gray-600 mt-1">{orders.length} đơn hàng được tìm thấy</p>
                                </div>
                                <div className="flex space-x-3 mt-4 sm:mt-0">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Tìm đơn hàng..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Filter className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="space-y-4">
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onViewDetail={handleViewOrderDetail}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                                        <p className="text-gray-600">Người dùng này chưa thực hiện đơn hàng nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
        </div>
    );
};

export default ProfileUser;
import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Ban, CheckCircle, Loader2, RotateCcw, Search,
    Shield, Eye, LogOut, Filter, RefreshCw, Mail, Phone, MapPin, Calendar
} from 'lucide-react';
import {
    getAllUsersApi,
    banUserApi,
    getAdminStatsApi,
    getUserByIdApi,
    type User,
    type AdminStats,
} from '../api/authApi';

// =========================================================
// 🎯 TYPES & INTERFACES
// =========================================================

interface UserFilters {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: string;
}

interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    usersPerPage: number;
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

const formatUserId = (id: any): string => {
    const idStr = safeString(id);
    return idStr.length > 8 ? `${idStr.substring(0, 8)}...` : idStr;
};

const formatDate = (dateString?: string | null): string => {
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

// =========================================================
// 🔹 COMPONENTS PHỤ TRỢ
// =========================================================

const AdminStatsCard: React.FC<{ stats: AdminStats }> = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-blue-100 text-sm font-medium">Tổng Người Dùng</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
            </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-purple-100 text-sm font-medium">Quản Trị Viên</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.totalAdmins}</h3>
                </div>
                <Shield className="w-10 h-10 text-purple-200" />
            </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-green-100 text-sm font-medium">Người Dùng Thường</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.totalNormalUsers}</h3>
                </div>
                <Users className="w-10 h-10 text-green-200" />
            </div>
        </div>
    </div>
);

interface UserDetailModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Chi tiết Người Dùng</h2>
                            <p className="text-blue-100 mt-1">Thông tin đầy đủ về tài khoản</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Thông tin cơ bản */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                                    Thông tin Cơ bản
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ID Người dùng</label>
                                        <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded mt-1">
                                            {safeString(user.id)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-sm text-gray-900 flex items-center mt-1">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {safeString(user.email)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Họ tên</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {safeString(user.name) || 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Trạng thái</h3>
                                <div className="flex flex-wrap gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        {user.role === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng'}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.status === 'active'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}>
                                        {user.status === 'active' ? '✅ Đang hoạt động' : '❌ Đã bị cấm'}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.email_verified
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                        {user.email_verified ? '📧 Đã xác thực' : '⏳ Chưa xác thực'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin liên hệ & thời gian */}
                        <div className="space-y-4">
                            {/* Thông tin liên hệ */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-green-500" />
                                    Thông tin Liên hệ
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                                        <p className="text-sm text-gray-900 flex items-center mt-1">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                            {safeString(user.phone) || 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                    {user.address && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                                            <p className="text-sm text-gray-900 flex items-start mt-1">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                                {safeString(user.address)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thời gian */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                                    Thời gian
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                                        <p className="text-sm text-gray-900">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                    {user.updated_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Cập nhật cuối</label>
                                            <p className="text-sm text-gray-900">
                                                {formatDate(user.updated_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
// 🎯 CUSTOM HOOKS
// =========================================================

const useUserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        usersPerPage: 10
    });

    const [filters, setFilters] = useState<UserFilters>({
        search: '',
        role: '',
        status: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    });

    const getToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    const handleInvalidToken = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
    }, []);

    const fetchData = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
            setLoading(false);
            handleInvalidToken();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.usersPerPage,
                ...filters
            };

            const [usersRes, statsRes] = await Promise.all([
                getAllUsersApi(params),
                getAdminStatsApi()
            ]);

            console.log('🔍 Users response:', usersRes);
            console.log('🔍 Stats response:', statsRes);

            let usersData: User[] = [];

            if (Array.isArray(usersRes)) {
                usersData = usersRes;
            } else if (usersRes.data && Array.isArray(usersRes.data.users)) {
                usersData = usersRes.data.users;
            } else if (usersRes.data && Array.isArray(usersRes.data)) {
                usersData = usersRes.data;
            } else if (Array.isArray(usersRes.users)) {
                usersData = usersRes.users;
            }

            const processedUsers = usersData.map(user => ({
                ...user,
                id: safeString(user.id)
            }));

            setUsers(processedUsers);

            let statsData: AdminStats | null = null;

            if (statsRes.data) {
                statsData = {
                    totalUsers: Number(statsRes.data.totalUsers) || 0,
                    totalAdmins: Number(statsRes.data.totalAdmins) || 0,
                    totalNormalUsers: Number(statsRes.data.totalNormalUsers) || 0
                };
            } else if (statsRes) {
                statsData = {
                    totalUsers: Number(statsRes.totalUsers) || 0,
                    totalAdmins: Number(statsRes.totalAdmins) || 0,
                    totalNormalUsers: Number(statsRes.totalNormalUsers) || 0
                };
            }

            if (statsData) {
                setStats(statsData);
            }

            if (usersRes.data?.pagination) {
                setPagination(prev => ({
                    ...prev,
                    totalPages: usersRes.data.pagination.totalPages || 1,
                    totalUsers: usersRes.data.pagination.totalUsers || processedUsers.length
                }));
            } else {
                setPagination(prev => ({
                    ...prev,
                    totalPages: Math.ceil(processedUsers.length / pagination.usersPerPage) || 1,
                    totalUsers: processedUsers.length
                }));
            }

        } catch (err: any) {
            console.error('❌ Error fetching data:', err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                handleInvalidToken();
            } else {
                setError(err.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.usersPerPage, filters, getToken, handleInvalidToken]);

    const handleBanUnban = async (userId: string, currentStatus: string) => {
        const token = getToken();
        if (!token) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            handleInvalidToken();
            return;
        }

        if (!window.confirm(
            `Bạn có chắc chắn muốn ${currentStatus === 'active' ? 'CẤM' : 'BỎ CẤM'} người dùng này không?`
        )) {
            return;
        }

        setActionLoading(userId);

        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await banUserApi(userId, { status: newStatus as 'active' | 'inactive' });

            alert(`✅ ${newStatus === 'inactive' ? 'Đã cấm' : 'Đã bỏ cấm'} người dùng thành công!`);
            fetchData();
        } catch (err: any) {
            alert('❌ Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật trạng thái.'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewDetail = async (userId: string): Promise<User | null> => {
        const token = getToken();
        if (!token) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            handleInvalidToken();
            return null;
        }

        try {
            const response = await getUserByIdApi(userId);
            if (response.success) {
                return {
                    ...response.data,
                    id: safeString(response.data.id)
                };
            } else {
                throw new Error(response.message || 'Lỗi khi tải thông tin chi tiết');
            }
        } catch (err: any) {
            alert('❌ Lỗi khi tải thông tin chi tiết: ' + (err.response?.data?.message || err.message));
            return null;
        }
    };

    const handleFilterChange = (key: keyof UserFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            role: '',
            status: '',
            sortBy: 'created_at',
            sortOrder: 'DESC'
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    return {
        users,
        stats,
        loading,
        error,
        actionLoading,
        pagination,
        filters,
        fetchData,
        handleBanUnban,
        handleViewDetail,
        handleFilterChange,
        handlePageChange,
        handleResetFilters,
        getToken,
        handleInvalidToken
    };
};

// =========================================================
// 🥇 COMPONENT CHÍNH: UserManagementPage
// =========================================================

const UserManagementPage: React.FC = () => {
    const {
        users,
        stats,
        loading,
        error,
        actionLoading,
        pagination,
        filters,
        fetchData,
        handleBanUnban,
        handleViewDetail,
        handleFilterChange,
        handlePageChange,
        handleResetFilters,
        getToken } = useUserManagement();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);

    const handleViewUserDetail = async (userId: string) => {
        const userDetail = await handleViewDetail(userId);
        if (userDetail) {
            setSelectedUser(userDetail);
            setIsDetailModalOpen(true);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        const token = getToken();
        if (token) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTokenChecked(true);
            fetchData();
        } else {
            loading(false);
        }
    }, [fetchData, getToken]);

    if (!tokenChecked && loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-lg text-gray-600">
                <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                <p>Đang kiểm tra xác thực...</p>
            </div>
        );
    }

    const token = getToken();
    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-lg text-red-600">
                <Shield className="w-16 h-16 mb-4 text-red-400" />
                <h2 className="text-xl font-bold mb-2">Lỗi xác thực</h2>
                <p className="mb-4 text-center">Vui lòng đăng nhập để truy cập trang quản lý người dùng</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Đi đến trang đăng nhập
                </button>
            </div>
        );
    }

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-lg text-gray-600">
                <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                <p>Đang tải dữ liệu người dùng...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div className="mb-4 lg:mb-0">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center">
                            <Users className="w-10 h-10 mr-4 text-blue-600" />
                            Quản Lý Người Dùng
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Quản lý và theo dõi tất cả người dùng trong hệ thống
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center self-start lg:self-auto"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Đăng xuất
                    </button>
                </div>

                {/* Thống kê */}
                {stats && <AdminStatsCard stats={stats} />}

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <Filter className="w-6 h-6 mr-3 text-blue-600" />
                            Bộ lọc & Tìm kiếm
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleResetFilters}
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </button>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="text-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Tìm kiếm</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Tìm theo email, tên, số điện thoại..."
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">👥 Vai trò</label>
                            <select
                                value={filters.role}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value="user">Người dùng</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📊 Trạng thái</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Đã bị cấm</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Sắp xếp</label>
                            <select
                                value={`${filters.sortBy}-${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-');
                                    handleFilterChange('sortBy', sortBy);
                                    handleFilterChange('sortOrder', sortOrder);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="created_at-DESC">Mới nhất</option>
                                <option value="created_at-ASC">Cũ nhất</option>
                                <option value="name-ASC">Tên A-Z</option>
                                <option value="name-DESC">Tên Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-red-700">
                                <span className="text-lg mr-2">⚠️</span>
                                {error}
                            </div>
                            <button
                                onClick={fetchData}
                                className="text-sm text-blue-600 hover:underline flex items-center font-medium"
                            >
                                <RotateCcw className="w-4 h-4 mr-1" /> Thử lại
                            </button>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50/30">
                        <h2 className="text-xl font-semibold text-gray-800">
                            📋 Danh sách Người Dùng ({pagination.totalUsers.toLocaleString()})
                        </h2>
                        <div className="text-sm text-gray-600">
                            Trang {pagination.currentPage} / {pagination.totalPages}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Thông tin Người dùng
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Liên hệ
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Vai trò & Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200/50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-base font-semibold text-gray-900">
                                                        {safeString(user.name) || 'Chưa đặt tên'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                                        <Mail className="w-4 h-4 mr-1" />
                                                        {safeString(user.email)}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-mono mt-1">
                                                        ID: {formatUserId(user.id)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {user.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 mr-2 text-green-500" />
                                                        {safeString(user.phone)}
                                                    </div>
                                                )}
                                                {user.address && (
                                                    <div className="flex items-start text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <span className="line-clamp-2">{safeString(user.address)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}>
                                                    {user.role === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng'}
                                                </span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                    {user.status === 'active' ? '✅ Hoạt động' : '❌ Đã cấm'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                    {formatDate(user.created_at)}
                                                </div>
                                                {user.email_verified && (
                                                    <div className="text-xs text-green-600 flex items-center">
                                                        ✅ Đã xác thực email
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleViewUserDetail(user.id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Xem chi tiết
                                                </button>
                                                <button
                                                    onClick={() => handleBanUnban(user.id, user.status)}
                                                    disabled={actionLoading === user.id}
                                                    className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center font-medium ${user.status === 'active'
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {actionLoading === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.status === 'active' ? (
                                                        <>
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Cấm
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Bỏ cấm
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {users.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Không có người dùng nào</h3>
                            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                {filters.search || filters.role || filters.status
                                    ? 'Thử thay đổi bộ lọc để tìm thấy kết quả phù hợp.'
                                    : 'Chưa có người dùng nào trong hệ thống.'
                                }
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/30">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-700">
                                    Hiển thị{' '}
                                    <span className="font-semibold">
                                        {((pagination.currentPage - 1) * pagination.usersPerPage) + 1}
                                    </span>{' '}
                                    đến{' '}
                                    <span className="font-semibold">
                                        {Math.min(pagination.currentPage * pagination.usersPerPage, pagination.totalUsers)}
                                    </span>{' '}
                                    trong{' '}
                                    <span className="font-semibold">{pagination.totalUsers}</span> kết quả
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        ← Trước
                                    </button>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(page =>
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            Math.abs(page - pagination.currentPage) <= 1
                                        )
                                        .map((page, index, array) => (
                                            <React.Fragment key={page}>
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="px-3 py-2 text-sm text-gray-500">...</span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${pagination.currentPage === page
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        ))
                                    }
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Sau →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            <UserDetailModal
                user={selectedUser}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
};

export default UserManagementPage;
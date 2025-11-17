"use client";
import React, { useEffect, useState } from "react";
// Trong component Profile.tsx, sửa import:
import {
    getProfile,
    updateProfile,
    changePassword,
    getUserStatistics
} from "../../NetWork/user.api";
import type {
    UserProfile,
    UpdateUserData,
    ChangePasswordData,
    UserStatistics
} from "../../NetWork/user.api";
import { logout } from "../../NetWork/auth.api";
import { useNavigate } from "react-router-dom";
import { clearUserSession, getUserSession } from "../../utils/session";
import { LogOut, Edit, Key, X, CheckCircle, AlertTriangle, Loader2, ShoppingCart, Package, Heart } from "lucide-react";

// --- Component Modal cơ bản ---
interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, className }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-500 ease-out scale-100 opacity-100 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-indigo-700 mx-auto">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-indigo-600 transition-colors rounded-full p-2 absolute right-4 top-4 bg-gray-50 hover:bg-gray-100"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface InfoFieldProps {
    label: string;
    value: string | null;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
        <span className="font-semibold text-gray-600 w-1/3">{label}:</span>
        <span className="text-gray-900 font-medium w-2/3 text-right">{value || <span className="italic text-gray-400">Chưa cập nhật</span>}</span>
    </div>
);

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type: string;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type, placeholder }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
        />
    </div>
);

// --- Component Profile chính ---

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [editData, setEditData] = useState<UpdateUserData>({});
    const [passwords, setPasswords] = useState<ChangePasswordData & { confirmPassword: string }>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error' | null>(null);

    const navigate = useNavigate();

    // Hàm đặt thông báo chung
    const setAppMessage = (msg: string | null, type: 'success' | 'error' | null = null) => {
        setMessage(msg);
        setMessageType(type);
        if (msg) {
            setTimeout(() => {
                setMessage(null);
                setMessageType(null);
            }, 5000);
        }
    };

    // Hàm đặt thông báo riêng cho Modal Password
    const setPasswordModalMessage = (msg: string | null, type: 'success' | 'error' | null = null) => {
        setPasswordMessage(msg);
        setPasswordMessageType(type);
    };

    // Lấy thông tin người dùng và thống kê
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes] = await Promise.all([
                    getProfile(),
                    getUserStatistics()
                ]);

                if (profileRes.success && profileRes.data) {
                    setUser(profileRes.data);
                    setEditData({
                        name: profileRes.data.name || "",
                        phone: profileRes.data.phone || "",
                        address: profileRes.data.address || "",
                        avatar: profileRes.data.avatar || "",
                    });
                } else {
                    setError(profileRes.message || "Không lấy được thông tin người dùng.");
                }

                if (statsRes.success && statsRes.data) {
                    setStatistics(statsRes.data);
                }
            } catch (err: any) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError(err?.message || "Lỗi khi tải thông tin người dùng.");
            } finally {
                setLoading(false);
                setStatsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Lỗi logout:", error);
        } finally {
            clearUserSession();
            setIsLoggingOut(false);
            navigate("/", { replace: true });
        }
    };

    // Cập nhật thông tin
    const handleUpdateProfile = async () => {
        setAppMessage(null);
        setIsUpdating(true);
        try {
            const dataToSend: UpdateUserData = {};

            // Chuẩn hóa dữ liệu: gửi undefined nếu người dùng để trống (tương thích với kiểu string | undefined)
            if (editData.name !== undefined) {
                dataToSend.name = editData.name.trim() === "" ? undefined : editData.name;
            }
            if (editData.phone !== undefined) {
                dataToSend.phone = editData.phone?.trim() === "" ? undefined : editData.phone;
            }
            if (editData.address !== undefined) {
                dataToSend.address = editData.address?.trim() === "" ? undefined : editData.address;
            }
            if (editData.avatar !== undefined) {
                dataToSend.avatar = editData.avatar?.trim() === "" ? undefined : editData.avatar;
            }

            const res = await updateProfile(dataToSend);
            if (res.success && res.data) {
                setUser(res.data);
                setEditMode(false);
                setAppMessage("Cập nhật thông tin thành công! 🎉", 'success');
            } else {
                setAppMessage(res.message || "Cập nhật thất bại.", 'error');
            }
        } catch (err: any) {
            console.error("Lỗi cập nhật profile:", err);
            setAppMessage(err?.message || "Lỗi mạng hoặc server.", 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    // Đổi mật khẩu
    const handleChangePassword = async () => {
        setPasswordModalMessage(null);

        const { oldPassword, newPassword, confirmPassword } = passwords;

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordModalMessage("Vui lòng điền đầy đủ thông tin.", 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordModalMessage("Mật khẩu mới và xác nhận không trùng nhau.", 'error');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordModalMessage("Mật khẩu mới phải có ít nhất 8 ký tự.", 'error');
            return;
        }

        setIsUpdating(true);

        try {
            const res = await changePassword({ oldPassword, newPassword });

            if (res.success) {
                setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
                setPasswordModalMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", 'success');

                // Đăng xuất sau khi đổi mật khẩu thành công
                setTimeout(() => {
                    clearUserSession();
                    setPasswordMode(false);
                    navigate("/", { replace: true });
                }, 2000);
            } else {
                setPasswordModalMessage(res.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.", 'error');
            }
        } catch (err: any) {
            console.error("Lỗi đổi mật khẩu:", err);
            setPasswordModalMessage(err?.message || "Lỗi kết nối. Vui lòng thử lại sau.", 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    // Khởi tạo lại editData khi mở modal chỉnh sửa
    const openEditModal = () => {
        if (user) {
            setEditData({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
                avatar: user.avatar || "",
            });
        }
        setEditMode(true);
        setPasswordMode(false);
        setAppMessage(null);
    }

    // Khởi tạo lại password và thông báo khi mở modal đổi mật khẩu
    const openPasswordModal = () => {
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordMessage(null);
        setPasswordMessageType(null);
        setPasswordMode(true);
        setEditMode(false);
        setAppMessage(null);
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-2" />
            <p className="text-xl text-gray-700 font-medium">Đang tải thông tin...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 text-center text-red-600 text-lg font-medium bg-red-100 rounded-lg m-4 border border-red-300">
            {error}
        </div>
    );

    if (!user) return (
        <div className="p-6 text-center text-gray-500 text-lg">Chưa có thông tin người dùng.</div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">Tài Khoản Cá Nhân 👤</h1>

                {/* Thống kê nhanh */}
                {!statsLoading && statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-blue-500">
                            <div className="flex items-center justify-center gap-3">
                                <Package className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.orders}</p>
                                    <p className="text-gray-600 font-medium">Đơn hàng</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-green-500">
                            <div className="flex items-center justify-center gap-3">
                                <ShoppingCart className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.cartItems}</p>
                                    <p className="text-gray-600 font-medium">Giỏ hàng</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-red-500">
                            <div className="flex items-center justify-center gap-3">
                                <Heart className="w-8 h-8 text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.wishlistItems}</p>
                                    <p className="text-gray-600 font-medium">Yêu thích</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Container Chính: Thông tin & Menu */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden md:flex">
                    {/* Sidebar/Menu chức năng */}
                    <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-indigo-100 bg-indigo-50">
                        <h2 className="text-xl font-bold text-indigo-800 mb-6 border-b pb-2 border-indigo-200">Quản Lý</h2>
                        <nav className="flex flex-col space-y-3">
                            <button
                                onClick={openEditModal}
                                className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-left group
                                    ${editMode
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-indigo-700 hover:bg-indigo-100 hover:translate-x-1'}
                                `}
                            >
                                <Edit className="w-5 h-5" /> Chỉnh sửa thông tin
                            </button>
                            <button
                                onClick={openPasswordModal}
                                className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-left group
                                    ${passwordMode
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-indigo-700 hover:bg-indigo-100 hover:translate-x-1'}
                                `}
                            >
                                <Key className="w-5 h-5" /> Đổi mật khẩu
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-left text-indigo-700 hover:bg-indigo-100 hover:translate-x-1"
                            >
                                <ShoppingCart className="w-5 h-5" /> Lịch sử đơn hàng
                            </button>
                        </nav>

                        {/* Nút Đăng xuất */}
                        <div className="mt-10 pt-4 border-t border-indigo-200">
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center justify-center w-full py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-center shadow-lg hover:shadow-xl"
                            >
                                {isLoggingOut ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogOut className="w-5 h-5 mr-2" />}
                                {isLoggingOut ? 'Đang đăng xuất' : 'Đăng xuất'}
                            </button>
                        </div>
                    </div>

                    {/* Hiển thị thông tin cá nhân chính */}
                    <div className="w-full md:w-2/3 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Thông Tin Chi Tiết</h2>

                        {/* Khu vực thông báo chung */}
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center mb-6 shadow-md ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                                {messageType === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                                <p className="text-base font-medium">{message}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-6 border-b border-gray-100 mb-6">
                            <img
                                src={user.avatar || "https://placehold.co/100x100/4F46E5/fff?text=U"}
                                alt="Avatar"
                                className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-xl object-cover"
                            />
                            <div>
                                <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{user.name}</p>
                                <p className="text-lg text-gray-500 mt-2">
                                    Vai trò: <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
                                </p>
                                <p className="text-sm text-gray-400 mt-1">ID: {user.id}</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-gray-700">
                            <InfoField label="Email" value={user.email} />
                            <InfoField label="Số điện thoại" value={user.phone} />
                            <InfoField label="Địa chỉ" value={user.address} />
                            <InfoField label="Trạng thái" value={user.status === 'active' ? 'Đang hoạt động' : user.status === 'deleted' ? 'Đã xóa' : 'Chờ xác nhận'} />
                            <InfoField label="Ngày tham gia" value={user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : "N/A"} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal chỉnh sửa thông tin */}
            <Modal
                title="Chỉnh Sửa Thông Tin Cá Nhân"
                isOpen={editMode}
                onClose={() => setEditMode(false)}
            >
                <div className="space-y-5">
                    <InputField
                        label="Tên"
                        value={editData.name || ""}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        type="text"
                    />
                    <InputField
                        label="Số điện thoại"
                        value={editData.phone || ""}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        type="tel"
                    />
                    <InputField
                        label="Địa chỉ"
                        value={editData.address || ""}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        type="text"
                    />
                    <InputField
                        label="Avatar URL (Không bắt buộc)"
                        value={editData.avatar || ""}
                        onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                        type="url"
                    />
                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            onClick={() => setEditMode(false)}
                            disabled={isUpdating}
                            className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={isUpdating}
                            className={`py-3 px-6 text-white rounded-lg transition-colors font-semibold shadow-md 
                                ${isUpdating
                                    ? 'bg-indigo-400 cursor-not-allowed flex items-center'
                                    : 'bg-indigo-600 hover:bg-indigo-700'}`
                            }
                        >
                            {isUpdating && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                            {isUpdating ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal đổi mật khẩu */}
            <Modal
                title="Đổi Mật Khẩu"
                isOpen={passwordMode}
                onClose={() => setPasswordMode(false)}
            >
                <div className="space-y-5">
                    {passwordMessage && (
                        <div className={`p-4 rounded-xl flex items-center mb-4 shadow-md ${passwordMessageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                            {passwordMessageType === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                            <p className="text-sm font-medium">{passwordMessage}</p>
                        </div>
                    )}

                    <InputField
                        label="Mật khẩu cũ"
                        placeholder="Nhập mật khẩu cũ"
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        type="password"
                    />
                    <InputField
                        label="Mật khẩu mới (ít nhất 8 ký tự)"
                        placeholder="Nhập mật khẩu mới"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        type="password"
                    />
                    <InputField
                        label="Xác nhận mật khẩu mới"
                        placeholder="Xác nhận mật khẩu mới"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        type="password"
                    />
                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            onClick={() => setPasswordMode(false)}
                            disabled={passwordMessageType === 'success' || isUpdating}
                            className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleChangePassword}
                            disabled={passwordMessageType === 'success' || isUpdating}
                            className={`py-3 px-6 text-white rounded-lg transition-colors font-semibold shadow-md 
                                ${isUpdating
                                    ? 'bg-indigo-400 cursor-not-allowed flex items-center'
                                    : passwordMessageType === 'success'
                                        ? 'bg-green-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'}`
                            }
                        >
                            {isUpdating && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                            {isUpdating ? 'Đang Lưu...' : passwordMessageType === 'success' ? 'Đang chuyển hướng...' : 'Đổi Mật Khẩu'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
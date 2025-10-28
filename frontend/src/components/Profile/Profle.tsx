"use client";
import React, { useEffect, useState } from "react";
// Import các hàm API thực tế bạn đã cung cấp
import { getProfile, updateProfile } from "../../NetWork/user.api";
import type { UserProfile, UpdateUserData } from "../../NetWork/user.api";
import { changePassword, logout } from "../../NetWork/auth.api"; // Đã sửa đường dẫn theo cấu trúc giả định
import { useNavigate } from "react-router-dom";
import { LogOut, Edit, Key, X, CheckCircle, AlertTriangle } from "lucide-react";

// Lưu ý: Các Interfaces UserProfile và UpdateUserData đã được import từ user.api.ts

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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"
                        aria-label="Đóng"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Component Profile chính ---

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [editData, setEditData] = useState<UpdateUserData>({});
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

    // Thông báo chung cho trang Profile (sau khi đóng modal)
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

    // Thông báo riêng cho Modal Đổi mật khẩu
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error' | null>(null);


    const navigate = useNavigate();

    // Hàm đặt thông báo chung (sau khi update profile, logout)
    const setAppMessage = (msg: string | null, type: 'success' | 'error' | null = null) => {
        setMessage(msg);
        setMessageType(type);
        if (msg) {
            // Tự động xóa thông báo sau 5 giây
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

        if (msg && type === 'success') {
            // Tự động xóa thông báo và đóng Modal sau 1.5 giây (theo yêu cầu)
            setTimeout(() => {
                // Xóa thông báo khỏi Modal
                setPasswordMessage(null);
                setPasswordMessageType(null);
                // Đóng Modal
                setPasswordMode(false);

                // Hiển thị thông báo thành công trên trang chính
                setAppMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", 'success');
            }, 1500);
        }
    };


    // Lấy thông tin người dùng
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await getProfile();
                if (res.success && res.data) {
                    setUser(res.data);
                    // Khởi tạo editData: Chuyển null thành "" để input không báo lỗi
                    setEditData({
                        name: res.data.name || "",
                        phone: res.data.phone || "",
                        address: res.data.address || "",
                        avatar: res.data.avatar || "",
                    });
                } else {
                    setError(res.message || "Không lấy được thông tin người dùng.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Lỗi khi tải thông tin người dùng.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Logout
    const handleLogout = async () => {
        try {
            await logout(); // Gọi API logout
        } catch {
            // Bỏ qua lỗi logout nếu server không phản hồi, vẫn xóa token cục bộ
        }

        // Xóa thông tin xác thực cục bộ (dù API thành công hay thất bại)
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");

        navigate("/login", { replace: true });
    };

    // Cập nhật thông tin
    const handleUpdateProfile = async () => {
        setAppMessage(null);
        try {
            const dataToSend: UpdateUserData = {};
            for (const key in editData) {
                const field = key as keyof UpdateUserData;
                const value = editData[field];
                // Gán null nếu là chuỗi rỗng cho các trường tùy chọn, giữ nguyên giá trị khác
                if (value === "") {
                    dataToSend[field] = null;
                } else if (value !== undefined) {
                    dataToSend[field] = value;
                }
            }

            const res = await updateProfile(dataToSend);
            if (res.success && res.data) {
                setUser(res.data);
                setEditMode(false);
                setAppMessage(res.message || "Cập nhật thông tin thành công! 🎉", 'success');
            } else {
                setAppMessage(res.message || "Cập nhật thất bại.", 'error');
            }
        } catch (err: any) {
            setAppMessage(err?.message || "Lỗi mạng hoặc server.", 'error');
        }
    };

    // Đổi mật khẩu
    const handleChangePassword = async () => {
        // 1. Reset thông báo trước khi bắt đầu
        setPasswordModalMessage(null);

        const { oldPassword, newPassword, confirmPassword } = passwords;

        // 2. Client-side Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordModalMessage("Vui lòng điền đầy đủ thông tin.", 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordModalMessage("Mật khẩu mới và xác nhận không trùng nhau.", 'error');
            return;
        }
        // Nên kiểm tra thêm độ mạnh mật khẩu (ví dụ: chứa ký tự đặc biệt, chữ hoa,...) nếu cần
        if (newPassword.length < 6) {
            setPasswordModalMessage("Mật khẩu mới phải có ít nhất 6 ký tự.", 'error');
            return;
        }

        // Tắt nút Lưu/Đổi Mật khẩu trong thời gian chờ API phản hồi (Tùy chọn, cần State `isSubmitting`)
        // setIsSubmitting(true); 

        try {
            // 3. Gọi API (apiClient tự thêm Authorization Header)
            const res = await changePassword(oldPassword, newPassword);

            if (res.success) {
                // ✅ THÀNH CÔNG
                // Tự động xóa input fields
                setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });

                // Hàm setPasswordModalMessage sẽ chịu trách nhiệm:
                // 1. Hiển thị thông báo thành công trong modal.
                // 2. Set timeout 1.5s.
                // 3. Tự động đóng modal và hiển thị thông báo chung sau 1.5s.
                setPasswordModalMessage(res.message || "Đổi mật khẩu thành công!", 'success');

            } else {
                // ❌ THẤT BẠI
                // Modal vẫn mở, hiển thị thông báo lỗi từ Server
                setPasswordModalMessage(res.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.", 'error');
            }

        } catch (err: any) {
            // 🚨 LỖI HỆ THỐNG/MẠNG
            const errorMessage = err?.message || "Lỗi kết nối. Vui lòng thử lại sau.";
            setPasswordModalMessage(errorMessage, 'error');
        } finally {
            // setIsSubmitting(false); // Bật lại nút nếu bạn dùng state này
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

    if (loading) return <div className="p-6 text-center text-gray-500 text-lg">Đang tải thông tin...</div>;
    if (error) return <div className="p-6 text-center text-red-600 text-lg font-medium bg-red-50 rounded-lg m-4">{error}</div>;
    if (!user) return <div className="p-6 text-center text-gray-500 text-lg">Chưa có thông tin người dùng.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center">Tài Khoản Cá Nhân 👤</h1>

                {/* Container Chính: Thông tin & Menu */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex">

                    {/* Sidebar/Menu chức năng */}
                    <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-indigo-50">
                        <h2 className="text-lg font-bold text-indigo-700 mb-4">Các Chức Năng</h2>
                        <nav className="flex flex-col space-y-2">
                            <button
                                onClick={openEditModal}
                                className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl font-medium transition-colors text-left
                                    ${editMode ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-100'}
                                `}
                            >
                                <Edit className="w-5 h-5" /> Chỉnh sửa thông tin
                            </button>
                            <button
                                onClick={openPasswordModal}
                                className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl font-medium transition-colors text-left
                                    ${passwordMode ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-100'}
                                `}
                            >
                                <Key className="w-5 h-5" /> Đổi mật khẩu
                            </button>
                        </nav>

                        {/* Nút Đăng xuất */}
                        <div className="mt-8 pt-4 border-t border-indigo-200">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center w-full py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold text-center shadow-lg hover:shadow-xl"
                            >
                                <LogOut className="w-5 h-5 mr-2" /> Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Hiển thị thông tin cá nhân chính */}
                    <div className="w-full md:w-2/3 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Chi Tiết</h2>

                        {/* Khu vực thông báo chung */}
                        {message && (
                            <div className={`p-3 rounded-lg flex items-center mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {messageType === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                                <p className="text-sm font-medium">{message}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100 mb-6">
                            <img
                                src={user.avatar || "https://placehold.co/100x100/4F46E5/fff?text=U"}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full border-4 border-indigo-400 shadow-lg object-cover"
                            />
                            <div>
                                <p className="text-3xl font-extrabold text-gray-900">{user.name}</p>
                                <p className="text-md text-gray-500 mt-1">Vai trò: <span className="font-semibold text-indigo-600">{user.role || "Người dùng"}</span></p>
                            </div>
                        </div>

                        <div className="space-y-4 text-gray-700">
                            <InfoField label="Email" value={user.email} />
                            <InfoField label="Số điện thoại" value={user.phone} />
                            <InfoField label="Địa chỉ" value={user.address} />
                            <InfoField label="Ngày tham gia" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal/Dialog chỉnh sửa thông tin */}
            <Modal
                title="Chỉnh Sửa Thông Tin Cá Nhân"
                isOpen={editMode}
                onClose={() => setEditMode(false)}
            >
                <div className="space-y-4">
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
                        type="text"
                    />
                    <InputField
                        label="Địa chỉ"
                        value={editData.address || ""}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        type="text"
                    />
                    <InputField
                        label="Avatar URL"
                        value={editData.avatar || ""}
                        onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                        type="text"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setEditMode(false)}
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpdateProfile}
                            className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
                        >
                            Lưu Thay Đổi
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal/Dialog đổi mật khẩu */}
            <Modal
                title="Đổi Mật Khẩu"
                isOpen={passwordMode}
                onClose={() => setPasswordMode(false)}
            >
                <div className="space-y-4">
                    {/* Khu vực thông báo riêng cho Modal Đổi mật khẩu */}
                    {passwordMessage && (
                        <div className={`p-3 rounded-lg flex items-center mb-4 ${passwordMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {passwordMessageType === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
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
                        label="Mật khẩu mới (ít nhất 6 ký tự)"
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
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setPasswordMode(false)}
                            // Vô hiệu hóa nút Hủy khi đang trong quá trình tự đóng thành công (để tránh gián đoạn)
                            disabled={passwordMessageType === 'success'}
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleChangePassword}
                            // Vô hiệu hóa nút Lưu khi thành công (vì nó đang tự đóng)
                            disabled={passwordMessageType === 'success'}
                            className={`py-2 px-4 text-white rounded-lg transition-colors font-medium shadow-md 
                                ${passwordMessageType === 'success'
                                    ? 'bg-green-500 cursor-not-allowed' // Màu xanh khi thành công và đang chờ đóng
                                    : 'bg-indigo-600 hover:bg-indigo-700'}`
                            }
                        >
                            {passwordMessageType === 'success' ? 'Đang đóng...' : 'Lưu Mật Khẩu'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;

// --- Components phụ trợ (Đã có trong code gốc, giữ nguyên) ---

interface InfoFieldProps {
    label: string;
    value: string | null;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
        <span className="font-semibold text-gray-600">{label}:</span>
        <span className="text-gray-900 font-medium">{value || <span className="italic text-gray-400">Chưa cập nhật</span>}</span>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
        />
    </div>
);
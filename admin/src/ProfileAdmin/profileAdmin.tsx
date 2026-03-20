import React, { useState, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    Edit3,
    Shield,
    Bell,
    Lock,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff
} from 'lucide-react';

// Interface cho dữ liệu profile
interface UserProfile {
    id: string;
    avatar: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    bio: string;
    role: string;
    joinDate: string;
    lastLogin: string;
    status: 'active' | 'inactive';
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacy: {
        profileVisible: boolean;
        searchable: boolean;
        twoFactorAuth: boolean;
    };
}

// Component chính
const ProfileAdmin: React.FC = () => {
    // State cho dữ liệu profile
    const [profile, setProfile] = useState<UserProfile>({
        id: 'USR-001',
        avatar: '/api/placeholder/150/150',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '+84 123 456 789',
        address: 'Hà Nội, Việt Nam',
        bio: 'Quản trị viên hệ thống với 5 năm kinh nghiệm trong lĩnh vực công nghệ và quản lý.',
        role: 'Super Admin',
        joinDate: '2023-01-15',
        lastLogin: '2024-12-19T10:30:00Z',
        status: 'active',
        notifications: {
            email: true,
            push: false,
            sms: true
        },
        privacy: {
            profileVisible: true,
            searchable: false,
            twoFactorAuth: true
        }
    });

    // State cho chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Xử lý thay đổi thông tin cơ bản
    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Xử lý thay đổi notifications
    const handleNotificationChange = (type: keyof typeof profile.notifications) => {
        setProfile(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
    };

    // Xử lý thay đổi privacy
    const handlePrivacyChange = (type: keyof typeof profile.privacy) => {
        setProfile(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [type]: !prev.privacy[type]
            }
        }));
    };

    // Xử lý upload avatar
    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', 'Kích thước file không được vượt quá 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setProfile(prev => ({
                    ...prev,
                    avatar: e.target?.result as string
                }));
                showMessage('success', 'Cập nhật ảnh đại diện thành công!');
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý lưu thông tin
    const handleSave = async () => {
        setIsLoading(true);

        // Giả lập API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showMessage('success', 'Cập nhật thông tin thành công!');
            setIsEditing(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showMessage('error', 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setIsLoading(false);
        }
    };

    // Hiển thị message
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Hồ sơ</h1>
                    <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg border animate-slide-down ${message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <XCircle className="w-5 h-5 mr-2" />
                            )}
                            {message.text}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 animate-fade-in-up">
                            {/* Avatar Section */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block group">
                                    <img
                                        src={profile.avatar}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-105"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:bg-cyan-600 hover:scale-110"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mt-4">{profile.fullName}</h2>
                                <p className="text-cyan-600 font-medium">{profile.role}</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${profile.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${profile.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                    {profile.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-2">
                                {[
                                    { id: 'profile', icon: User, label: 'Thông tin cá nhân' },
                                    { id: 'security', icon: Shield, label: 'Bảo mật' },
                                    { id: 'notifications', icon: Bell, label: 'Thông báo' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as any)}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                                ? 'bg-cyan-50 text-cyan-600 border-r-4 border-cyan-500'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            {/* Stats */}
                            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Tham gia:</span>
                                        <span className="font-medium">{formatDate(profile.joinDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Đăng nhập cuối:</span>
                                        <span className="font-medium">{formatDate(profile.lastLogin)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
                            {/* Tab Content */}
                            {activeTab === 'profile' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h3>
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg transition-all duration-200 hover:bg-cyan-600 hover:shadow-lg"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Form fields */}
                                        {[
                                            { icon: User, label: 'Họ và tên', field: 'fullName', type: 'text' },
                                            { icon: Mail, label: 'Email', field: 'email', type: 'email' },
                                            { icon: Phone, label: 'Số điện thoại', field: 'phone', type: 'tel' },
                                            { icon: MapPin, label: 'Địa chỉ', field: 'address', type: 'text' }
                                        ].map(({ icon: Icon, label, field, type }) => (
                                            <div key={field} className="animate-fade-in">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Icon className="w-4 h-4 inline mr-2" />
                                                    {label}
                                                </label>
                                                <input
                                                    type={type}
                                                    value={profile[field as keyof UserProfile] as string}
                                                    onChange={(e) => handleInputChange(field as keyof UserProfile, e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bio */}
                                    <div className="mt-6 animate-fade-in">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Giới thiệu bản thân
                                        </label>
                                        <textarea
                                            value={profile.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            disabled={!isEditing}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                                        />
                                    </div>

                                    {/* Save Button */}
                                    {isEditing && (
                                        <div className="flex justify-end mt-6 animate-slide-up">
                                            <button
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg transition-all duration-200 hover:bg-green-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                ) : (
                                                    <Save className="w-5 h-5 mr-2" />
                                                )}
                                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt bảo mật</h3>

                                    <div className="space-y-6">
                                        {/* Privacy Settings */}
                                        <div className="bg-gray-50 rounded-xl p-6 animate-fade-in">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <Lock className="w-5 h-5 mr-2" />
                                                Quyền riêng tư
                                            </h4>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'profileVisible', label: 'Hiển thị hồ sơ công khai', description: 'Cho phép người khác xem hồ sơ của bạn' },
                                                    { key: 'searchable', label: 'Cho phép tìm kiếm', description: 'Cho phép người khác tìm thấy bạn trong tìm kiếm' },
                                                    { key: 'twoFactorAuth', label: 'Xác thực 2 yếu tố', description: 'Bảo vệ tài khoản với xác thực 2 bước' }
                                                ].map(({ key, label, description }) => (
                                                    <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{label}</div>
                                                            <div className="text-sm text-gray-600">{description}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handlePrivacyChange(key as keyof typeof profile.privacy)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${profile.privacy[key as keyof typeof profile.privacy]
                                                                    ? 'bg-cyan-500'
                                                                    : 'bg-gray-300'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${profile.privacy[key as keyof typeof profile.privacy]
                                                                        ? 'translate-x-6'
                                                                        : 'translate-x-1'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Password Change */}
                                        <div className="bg-gray-50 rounded-xl p-6 animate-fade-in">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Mật khẩu mới
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                            placeholder="Nhập mật khẩu mới"
                                                        />
                                                        <button
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <button className="w-full bg-cyan-500 text-white py-3 rounded-lg transition-all duration-200 hover:bg-cyan-600 hover:shadow-lg">
                                                    Cập nhật mật khẩu
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt thông báo</h3>

                                    <div className="space-y-6">
                                        {[
                                            { key: 'email', label: 'Thông báo qua Email', description: 'Nhận thông báo quan trọng qua email' },
                                            { key: 'push', label: 'Thông báo đẩy', description: 'Hiển thị thông báo trên trình duyệt' },
                                            { key: 'sms', label: 'Thông báo SMS', description: 'Nhận tin nhắn SMS cho các giao dịch quan trọng' }
                                        ].map(({ key, label, description }) => (
                                            <div key={key} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md animate-fade-in">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">{label}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{description}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleNotificationChange(key as keyof typeof profile.notifications)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${profile.notifications[key as keyof typeof profile.notifications]
                                                            ? 'bg-cyan-500'
                                                            : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${profile.notifications[key as keyof typeof profile.notifications]
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
      `}</style>
        </div>
    );
};

export default ProfileAdmin;
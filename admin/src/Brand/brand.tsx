// components/brands/BrandList.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    getBrandsApi,
    createBrandApi,
    updateBrandApi,
    deleteBrandApi,
    toggleBrandStatusApi,
    createBrandFormData,
    updateBrandFormData,
    type Brand,
    type BrandCreateData,
    type BrandUpdateData
} from '../api/brandApi';

// 🏷️ Interface cho props
interface BrandListProps {
    onBrandSelect?: (brand: Brand) => void;
}

// eslint-disable-next-line no-empty-pattern
const BrandList: React.FC<BrandListProps> = ({ }) => {
    // 📦 State management
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // 🔍 Filter state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        is_active: '' as string | boolean,
        sortBy: 'name',
        sortOrder: 'ASC' as 'ASC' | 'DESC'
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // 🎯 Brand form state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);

    const [brandForm, setBrandForm] = useState<BrandCreateData & { logo?: File; logo_preview?: string; remove_logo?: boolean }>({
        name: '',
        slug: '',
        description: '',
        website_url: '',
        sort_order: 0,
        is_active: true,
        logo_url: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // =========================================================
    // 📋 DATA FETCHING
    // =========================================================

    // 🔄 Load brands với filters
    const loadBrands = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getBrandsApi({
                ...filters,
                is_active: filters.is_active === '' ? undefined : filters.is_active === 'true'
            });

            if (response.success) {
                setBrands(response.data.brands);
                setPagination(response.data.pagination);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tải danh sách thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    // 📥 Load trên mount và khi filters thay đổi
    useEffect(() => {
        loadBrands();
    }, [filters]);

    // =========================================================
    // 🎯 BRAND OPERATIONS
    // =========================================================

    // ➕ Tạo brand mới
    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            let response;

            // Nếu có file logo, sử dụng FormData
            if (brandForm.logo) {
                const formData = createBrandFormData({
                    ...brandForm,
                    logo: brandForm.logo
                });
                response = await createBrandApi(formData);
            } else {
                // Ngược lại dùng JSON thông thường
                response = await createBrandApi(brandForm);
            }

            if (response.success) {
                setSuccess('Tạo thương hiệu thành công!');
                setShowCreateModal(false);
                resetBrandForm();
                loadBrands();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tạo thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    // ✏️ Cập nhật brand
    const handleUpdateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBrand) return;

        try {
            setLoading(true);
            setError('');

            let response;

            // Nếu có file logo mới hoặc remove_logo, sử dụng FormData
            if (brandForm.logo || brandForm.remove_logo) {
                const formData = updateBrandFormData({
                    name: brandForm.name,
                    slug: brandForm.slug,
                    description: brandForm.description,
                    website_url: brandForm.website_url,
                    sort_order: brandForm.sort_order,
                    is_active: brandForm.is_active,
                    logo_url: brandForm.logo_url,
                    remove_logo: brandForm.remove_logo,
                    logo: brandForm.logo
                });
                response = await updateBrandApi(selectedBrand.id, formData);
            } else {
                // Ngược lại dùng JSON thông thường
                const updateData: BrandUpdateData = {
                    name: brandForm.name,
                    slug: brandForm.slug,
                    description: brandForm.description,
                    website_url: brandForm.website_url,
                    sort_order: brandForm.sort_order,
                    is_active: brandForm.is_active,
                    logo_url: brandForm.logo_url
                };
                response = await updateBrandApi(selectedBrand.id, updateData);
            }

            if (response.success) {
                setSuccess('Cập nhật thương hiệu thành công!');
                setShowEditModal(false);
                resetBrandForm();
                loadBrands();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    // 🗑️ Xóa brand
    const handleDeleteBrand = async (brand: Brand) => {
        try {
            setLoading(true);
            setError('');

            const response = await deleteBrandApi(brand.id);

            if (response.success) {
                setSuccess('Xóa thương hiệu thành công!');
                setDeleteConfirm(null);
                loadBrands();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi xóa thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Toggle trạng thái brand
    const handleToggleStatus = async (brandId: string) => {
        try {
            setError('');

            const response = await toggleBrandStatusApi(brandId);

            if (response.success) {
                setSuccess(`Đã ${response.data.is_active ? 'kích hoạt' : 'vô hiệu hóa'} thương hiệu!`);
                loadBrands();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
        }
    };

    // =========================================================
    // 🎯 FORM HANDLERS
    // =========================================================

    // 🖼️ Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chọn file hình ảnh');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Kích thước file không được vượt quá 5MB');
                return;
            }

            setBrandForm(prev => ({
                ...prev,
                logo: file,
                logo_preview: URL.createObjectURL(file),
                remove_logo: false
            }));
        }
    };

    // 🗑️ Remove logo
    const handleRemoveLogo = () => {
        setBrandForm(prev => ({
            ...prev,
            logo: undefined,
            logo_preview: undefined,
            logo_url: '',
            remove_logo: true
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 🆕 Mở modal tạo mới
    const handleShowCreateModal = () => {
        resetBrandForm();
        setShowCreateModal(true);
        setError('');
    };

    // ✏️ Mở modal chỉnh sửa
    const handleShowEditModal = (brand: Brand) => {
        setSelectedBrand(brand);
        setBrandForm({
            name: brand.name,
            slug: brand.slug,
            description: brand.description || '',
            website_url: brand.website_url || '',
            sort_order: brand.sort_order,
            is_active: brand.is_active,
            logo_url: brand.logo_url || '',
            logo_preview: brand.logo_url || undefined
        });
        setShowEditModal(true);
        setError('');
    };

    // 🚫 Reset form
    const resetBrandForm = () => {
        setBrandForm({
            name: '',
            slug: '',
            description: '',
            website_url: '',
            sort_order: 0,
            is_active: true,
            logo_url: ''
        });
        setSelectedBrand(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 🔄 Handle filter changes
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            ...(key !== 'page' && { page: 1 })
        }));
    };

    // 🔄 Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setBrandForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
                : type === 'number' ? parseInt(value) || 0
                    : value
        }));
    };

    // =========================================================
    // 🎯 RENDER COMPONENTS
    // =========================================================

    // 🗑️ Delete confirmation modal
    const ConfirmDeleteModal: React.FC = () => {
        if (!deleteConfirm) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa thương hiệu <strong>"{deleteConfirm.name}"</strong>?
                            <br />
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDeleteBrand(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 🖼️ Logo upload section
    const LogoUploadSection: React.FC = () => {
        const currentLogo = brandForm.logo_preview || brandForm.logo_url;

        return (
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Logo thương hiệu</label>

                {/* Logo preview */}
                {currentLogo && (
                    <div className="flex items-center space-x-4">
                        <img
                            src={currentLogo}
                            alt="Logo preview"
                            className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            Xóa logo
                        </button>
                    </div>
                )}

                {/* Upload options */}
                <div className="space-y-2">
                    {/* File upload */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                            📁 Chọn file từ máy tính
                        </button>
                    </div>

                    {/* Or separator */}
                    <div className="text-center text-gray-500 text-sm">hoặc</div>

                    {/* URL input */}
                    <div>
                        <input
                            type="url"
                            name="logo_url"
                            value={brandForm.logo_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/logo.png"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nhập URL hình ảnh từ internet</p>
                    </div>
                </div>
            </div>
        );
    };

    // ➕ Create/Edit Brand Modal
    const BrandModal: React.FC<{
        isOpen: boolean;
        isEdit?: boolean;
        onClose: () => void;
        onSubmit: (e: React.FormEvent) => void;
    }> = ({ isOpen, isEdit = false, onClose, onSubmit }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {isEdit ? 'Chỉnh sửa thương hiệu' : 'Tạo thương hiệu mới'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên thương hiệu *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={brandForm.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập tên thương hiệu"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug *
                                        </label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={brandForm.slug}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                            placeholder="ten-thuong-hieu"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Website URL
                                        </label>
                                        <input
                                            type="url"
                                            name="website_url"
                                            value={brandForm.website_url}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="space-y-4">
                                    <LogoUploadSection />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Thứ tự
                                            </label>
                                            <input
                                                type="number"
                                                name="sort_order"
                                                value={brandForm.sort_order}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    checked={brandForm.is_active}
                                                    onChange={handleInputChange}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={brandForm.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Mô tả về thương hiệu..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {loading && (
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    <span>{loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // =========================================================
    // 🎯 MAIN RENDER
    // =========================================================

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* 📊 Header với thống kê và actions */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Thương hiệu</h1>
                        <p className="text-gray-600 mt-1">Quản lý danh sách thương hiệu sản phẩm</p>
                    </div>
                    <button
                        onClick={handleShowCreateModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Thêm thương hiệu</span>
                    </button>
                </div>

                {/* 💬 Alert messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-800">{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-800">{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* 🔍 Filter section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Status filter */}
                    <select
                        value={filters.is_active.toString()}
                        onChange={(e) => handleFilterChange('is_active', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Đang kích hoạt</option>
                        <option value="false">Đã vô hiệu hóa</option>
                    </select>

                    {/* Sort by */}
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="name">Sắp xếp theo tên</option>
                        <option value="sort_order">Sắp xếp theo thứ tự</option>
                        <option value="created_at">Sắp xếp theo ngày tạo</option>
                    </select>

                    {/* Sort order */}
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ASC">Tăng dần</option>
                        <option value="DESC">Giảm dần</option>
                    </select>
                </div>
            </div>

            {/* 📋 Brands table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thương hiệu
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Slug
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Website
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thứ tự
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {brands.map((brand) => (
                                        <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    {brand.logo_url && (
                                                        <img
                                                            src={brand.logo_url}
                                                            alt={brand.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{brand.name}</div>
                                                        {brand.description && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {brand.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                                {brand.slug}
                                            </td>
                                            <td className="px-6 py-4">
                                                {brand.website_url ? (
                                                    <a
                                                        href={brand.website_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {brand.sort_order}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {brand.is_active ? 'Kích hoạt' : 'Vô hiệu'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleShowEditModal(brand)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleStatus(brand.id)}
                                                        className={`p-1 rounded transition-colors ${brand.is_active
                                                                ? 'text-orange-600 hover:text-orange-800'
                                                                : 'text-green-600 hover:text-green-800'
                                                            }`}
                                                        title={brand.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                    >
                                                        {brand.is_active ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteConfirm(brand)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {brands.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-gray-500 text-lg">Không tìm thấy thương hiệu nào</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {filters.search || filters.is_active !== ''
                                                        ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                                                        : 'Bắt đầu bằng cách thêm thương hiệu đầu tiên'
                                                    }
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 📄 Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Hiển thị {brands.length} của {pagination.totalItems} thương hiệu
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        disabled={filters.page === 1}
                                        onClick={() => handleFilterChange('page', filters.page - 1)}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Trước
                                    </button>

                                    <span className="px-3 py-1 text-sm text-gray-700">
                                        Trang {pagination.currentPage} / {pagination.totalPages}
                                    </span>

                                    <button
                                        disabled={filters.page === pagination.totalPages}
                                        onClick={() => handleFilterChange('page', filters.page + 1)}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 🎯 Modals */}
            <BrandModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateBrand}
            />

            <BrandModal
                isOpen={showEditModal}
                isEdit={true}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleUpdateBrand}
            />

            <ConfirmDeleteModal />
        </div>
    );
};

export default BrandList;
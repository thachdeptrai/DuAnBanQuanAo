import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Image as ImageIcon,
    FolderOpen,
    TrendingUp,
    BarChart3,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    AlertCircle,
} from 'lucide-react';
import axiosClient from '../api/axiosClient'; // Import axiosClient

// Interface cho Category
interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    createdAt?: string;
    updatedAt?: string;
    children?: Category[];
    product_count?: number;
}

// Interface cho thống kê
interface CategoryStats {
    total_categories: number;
    active_categories: number;
    inactive_categories: number;
    parent_categories: number;
    child_categories: number;
    categories_with_products: Array<{
        id: string;
        name: string;
        product_count: number;
    }>;
}

// Component chính
const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<CategoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'sort_order',
        direction: 'asc'
    });
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent_id: '' as string | number,
        description: '',
        image_url: '',
        sort_order: 0,
        is_active: true,
        meta_title: '',
        meta_description: ''
    });

    // Fetch categories và stats sử dụng axiosClient
    const fetchData = async () => {
        try {
            setLoading(true);
            setFormError(null);

            // Sử dụng axiosClient thay vì fetch
            const [categoriesResponse, statsResponse] = await Promise.all([
                axiosClient.get('/categories'),
                axiosClient.get('/categories/stats/overview')
            ]);

            if (categoriesResponse.data.success) {
                setCategories(categoriesResponse.data.data.categories || categoriesResponse.data.data);
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

        } catch (error: any) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                setFormError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setFormError('Lỗi khi tải dữ liệu từ server');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter và sort categories
    const filteredAndSortedCategories = React.useMemo(() => {
        const filtered = categories.filter(category => {
            const matchesSearch =
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.slug.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                activeFilter === 'all' ||
                (activeFilter === 'active' && category.is_active) ||
                (activeFilter === 'inactive' && !category.is_active);

            return matchesSearch && matchesFilter;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Category];
            let bValue: any = b[sortConfig.key as keyof Category];

            if (sortConfig.key === 'parent_id') {
                aValue = a.parent_id || 0;
                bValue = b.parent_id || 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [categories, searchTerm, activeFilter, sortConfig]);

    // Handle sort
    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Toggle row expansion
    const toggleRowExpansion = (categoryId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            parent_id: '',
            description: '',
            image_url: '',
            sort_order: 0,
            is_active: true,
            meta_title: '',
            meta_description: ''
        });
        setEditingCategory(null);
        setFormError(null);
    };

    // Open modal for create/edit
    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                parent_id: category.parent_id || '',
                description: category.description || '',
                image_url: category.image_url || '',
                sort_order: category.sort_order,
                is_active: category.is_active,
                meta_title: category.meta_title || '',
                meta_description: category.meta_description || ''
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9 ]/g, '')
            .replace(/\s+/g, '-');
    };

    // Handle form submit sử dụng axiosClient
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        try {
            const submitData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name),
                parent_id: formData.parent_id || null
            };

            let response;
            if (editingCategory) {
                response = await axiosClient.put(`/categories/${editingCategory.id}`, submitData);
            } else {
                response = await axiosClient.post('/categories', submitData);
            }

            if (response.data.success) {
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                setFormError(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Error saving category:', error);
            if (error.response?.status === 401) {
                setFormError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError('Có lỗi xảy ra khi kết nối đến server');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete sử dụng axiosClient
    const handleDelete = async (id: number) => {
        try {
            const response = await axiosClient.delete(`/categories/${id}`);

            if (response.data.success) {
                setDeleteConfirm(null);
                fetchData();
            } else {
                console.error(response.data.message || 'Có lỗi xảy ra khi xóa');
            }
        } catch (error: any) {
            console.error('Error deleting category:', error);
            if (error.response?.status === 401) {
                setFormError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            }
        }
    };

    // Toggle active status sử dụng axiosClient
    const toggleActive = async (category: Category) => {
        try {
            const response = await axiosClient.patch(`/categories/${category.id}/toggle-status`);

            if (response.data.success) {
                fetchData();
            } else {
                console.error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Error toggling category status:', error);
            if (error.response?.status === 401) {
                setFormError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            }
        }
    };

    // Get parent category name
    const getParentName = (parentId: number | null) => {
        if (!parentId) return 'Danh mục gốc';
        const parent = categories.find(cat => cat.id === parentId);
        return parent ? parent.name : 'Không xác định';
    };

    // Render sort indicator
    const renderSortIndicator = (key: string) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Danh mục</h1>
                        <p className="text-gray-600 text-lg">Quản lý danh mục sản phẩm và tổ chức hệ thống</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Làm mới
                    </button>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Tổng danh mục</p>
                                    <p className="text-3xl font-bold mt-2">{stats.total_categories}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Đang hoạt động</p>
                                    <p className="text-3xl font-bold mt-2">{stats.active_categories}</p>
                                </div>
                                <Eye className="w-8 h-8 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Đã ẩn</p>
                                    <p className="text-3xl font-bold mt-2">{stats.inactive_categories}</p>
                                </div>
                                <EyeOff className="w-8 h-8 text-orange-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Danh mục gốc</p>
                                    <p className="text-3xl font-bold mt-2">{stats.parent_categories}</p>
                                </div>
                                <FolderOpen className="w-8 h-8 text-purple-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm font-medium">Danh mục con</p>
                                    <p className="text-3xl font-bold mt-2">{stats.child_categories}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-cyan-200" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, slug, mô tả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex space-x-2">
                            <select
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value as any)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Đã ẩn</option>
                            </select>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => openModal()}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm danh mục
                    </button>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                            <tr>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Danh mục</span>
                                        {renderSortIndicator('name')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                    onClick={() => handleSort('parent_id')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Danh mục cha</span>
                                        {renderSortIndicator('parent_id')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                    onClick={() => handleSort('sort_order')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Thứ tự</span>
                                        {renderSortIndicator('sort_order')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAndSortedCategories.map((category) => (
                                <React.Fragment key={category.id}>
                                    <tr className="hover:bg-gray-50/80 transition-all duration-150 group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {category.children && category.children.length > 0 && (
                                                    <button
                                                        onClick={() => toggleRowExpansion(category.id)}
                                                        className="mr-2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                                                    >
                                                        {expandedRows.has(category.id) ?
                                                            <ChevronUp className="w-4 h-4" /> :
                                                            <ChevronDown className="w-4 h-4" />
                                                        }
                                                    </button>
                                                )}
                                                {(!category.children || category.children.length === 0) && (
                                                    <div className="w-4 mr-2"></div>
                                                )}
                                                {category.image_url ? (
                                                    <img
                                                        src={category.image_url}
                                                        alt={category.name}
                                                        className="w-12 h-12 rounded-xl object-cover mr-4 shadow-sm"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mr-4 shadow-sm">
                                                        <FolderOpen className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors duration-150">
                                                        {category.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 font-mono">
                                                        /{category.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {getParentName(category.parent_id)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {category.sort_order}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {category.product_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleActive(category)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${category.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-green-200/50'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200 shadow-red-200/50'
                                                    }`}
                                            >
                                                {category.is_active ? (
                                                    <>
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        Hiển thị
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3 h-3 mr-1" />
                                                        Ẩn
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="text-cyan-600 hover:text-cyan-800 p-2 rounded-lg hover:bg-cyan-50 transition-all duration-150"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(category.id)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-150"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded row for children */}
                                    {expandedRows.has(category.id) && category.children && category.children.length > 0 && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="ml-16">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Danh mục con ({category.children.length}):</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {category.children.map(child => (
                                                            <div key={child.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        {child.image_url ? (
                                                                            <img
                                                                                src={child.image_url}
                                                                                alt={child.name}
                                                                                className="w-8 h-8 rounded-lg object-cover mr-3"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                                                                                <FolderOpen className="w-4 h-4 text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">{child.name}</div>
                                                                            <div className="text-xs text-gray-500">{child.slug}</div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleActive(child)}
                                                                        className={`ml-2 p-1 rounded ${child.is_active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                                                                            }`}
                                                                    >
                                                                        {child.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedCategories.length === 0 && (
                    <div className="text-center py-16">
                        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Không tìm thấy danh mục nào</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {searchTerm || activeFilter !== 'all'
                                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                                : 'Bắt đầu bằng cách thêm danh mục đầu tiên'
                            }
                        </p>
                        <button
                            onClick={() => openModal()}
                            className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium text-sm"
                        >
                            Thêm danh mục đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition duration-150 p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {formError && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                                        <p className="text-red-800 text-sm">{formError}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Tên danh mục *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                    slug: formData.slug || generateSlug(e.target.value)
                                                })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                                placeholder="Nhập tên danh mục"
                                            />
                                        </div>

                                        {/* Slug */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Slug *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 font-mono"
                                                placeholder="ten-danh-muc"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Slug sẽ được tạo tự động từ tên danh mục</p>
                                        </div>

                                        {/* Parent Category */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Danh mục cha
                                            </label>
                                            <select
                                                value={formData.parent_id}
                                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                            >
                                                <option value="">-- Chọn danh mục cha --</option>
                                                {categories
                                                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                                                    .map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* Sort Order */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Thứ tự sắp xếp
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sort_order}
                                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Image URL */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                URL hình ảnh
                                            </label>
                                            <div className="flex space-x-3">
                                                <input
                                                    type="text"
                                                    value={formData.image_url}
                                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                                <button
                                                    type="button"
                                                    className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition duration-150 bg-white"
                                                >
                                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-700">Hiển thị danh mục</span>
                                            </label>
                                        </div>

                                        {/* Meta Title */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Meta Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.meta_title}
                                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                                placeholder="Tiêu đề SEO"
                                            />
                                        </div>

                                        {/* Meta Description */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Meta Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.meta_description}
                                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 resize-none"
                                                placeholder="Mô tả SEO..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Mô tả
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 resize-none"
                                        placeholder="Mô tả về danh mục..."
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        disabled={submitting}
                                        className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            editingCategory ? 'Cập nhật' : 'Tạo mới'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Xác nhận xóa
                            </h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Bạn có chắc chắn muốn xóa danh mục này?
                                <br />
                                Tất cả dữ liệu liên quan sẽ bị xóa và không thể khôi phục.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/25 font-medium"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
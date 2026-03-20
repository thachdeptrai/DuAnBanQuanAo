// Home.tsx - Phiên bản đã sửa lỗi
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import HeroBanner from "../components/Hero/HeroBanner";
import Footer from "../components/Footer/Footer";
import CategorySection from "../components/Category/CategoryGrid";
import ProductGrid from "../components/Product/ProductGrid";
import { categoryApi, type Category } from "../NetWork/category.api"; // 🟢 import đúng

const Home: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // 🟢 Gọi API lấy danh mục - ĐÃ SỬA LỖI
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                // 🟢 Sử dụng API đúng từ categoryApi
                const res = await categoryApi.getActiveCategories();

                if (res.success && Array.isArray(res.data)) {
                    // 🟢 Chuẩn hóa dữ liệu cho UI
                    const formattedCategories = formatCategoriesForUI(res.data);
                    setCategories(formattedCategories);
                } else {
                    console.warn("⚠️ Không lấy được danh mục:", res.message);
                    setError("Không thể tải danh mục sản phẩm");
                }
            } catch (error) {
                console.error("❌ Lỗi khi gọi API danh mục:", error);
                setError("Có lỗi xảy ra khi tải danh mục");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 🟢 Hàm chuẩn hóa dữ liệu danh mục cho UI
    const formatCategoriesForUI = (apiCategories: Category[]): Category[] => {
        return apiCategories.flatMap(category => {
            const formattedParent: Category = {
                id: category.id,
                name: category.name,
                slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
                image: category.image
                    ? `${import.meta.env.VITE_API_URL}${category.image}`
                    : "/images/placeholder.jpg",
                description: category.description,
                parent_id: category.parent_id,
                // Thêm các trường cần thiết khác
            };

            // Xử lý danh mục con nếu có
            const children = category.children?.map(child => ({
                id: child.id,
                name: child.name,
                slug: child.slug || child.name.toLowerCase().replace(/\s+/g, "-"),
                image: child.image
                    ? `${import.meta.env.VITE_API_URL}${child.image}`
                    : "/images/placeholder.jpg",
                description: child.description,
                parent_id: child.parent_id,
            })) || [];

            return [formattedParent, ...children];
        });
    };

    // 🟢 Khi click vào danh mục - ĐÃ SỬA LỖI TYPE
    const handleCategoryClick = (id: number) => { // 🟢 Sửa Number thành number
        navigate(`/category/${id}`);
    };



    // 🟢 Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <HeroBanner images={[]} />
                <div className="text-center py-20">
                    <div className="text-red-500 text-xl mb-4">❌</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroBanner images={[]} />

            {/* 🟢 Hiển thị danh mục */}
            {categories.length > 0 ? (
                <CategorySection
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                />
            ) : (
                <div className="text-center py-20 text-gray-500">
                    Không có danh mục nào để hiển thị
                </div>
            )}

            <ProductGrid />
            <Footer />
        </div>
    );
};

export default Home;
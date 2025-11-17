import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import HeroBanner from "../components/Hero/HeroBanner";
import Footer from "../components/Footer/Footer";
import CategorySection from "../components/Category/CategoryGrid";
import ProductGrid from "../components/Product/ProductGrid";
import { getAllCategories } from "../NetWork/category.api"; // 🟢 import API
import type { Category } from "../NetWork/category.api"; // 🟢 import type

const Home: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🟡 Gọi API lấy danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getAllCategories();

                if (res.success && Array.isArray(res.data)) {
                    // Chuẩn hóa dữ liệu cho UI nếu cần
                    const formatted = res.data.map((item) => ({
                        id: item.id, // 🟢 để nguyên kiểu number
                        name: item.name,
                        slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
                        image: item.image_url
                            ? `${import.meta.env.VITE_API_URL}${item.image_url}`
                            : "/images/placeholder.jpg",
                        product_count: Math.floor(Math.random() * 50) + 1,
                    }));



                    setCategories(formatted);
                } else {
                    console.warn("⚠️ Không lấy được danh mục:", res.message);
                }
            } catch (error) {
                console.error("❌ Lỗi khi gọi API danh mục:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 🟢 Khi click vào danh mục
    const handleCategoryClick = (id: Number) => {
        navigate(`/category/${id}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroBanner images={[]} />

            {/* 🟢 Loading state */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 text-lg">
                    Đang tải danh mục...
                </div>
            ) : (
                <CategorySection
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                />
            )}

            <ProductGrid />
            <Footer />
        </div>
    );
};

export default Home;

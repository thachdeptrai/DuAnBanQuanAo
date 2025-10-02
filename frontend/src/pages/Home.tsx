import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import HeroBanner from "../components/Hero/HeroBanner";
import Footer from "../components/Footer/Footer";
import CategorySection from "../components/Category/CategoryGrid";
import ProductGrid from "../components/Product/ProductGrid";

interface Category {
    id: string;
    name: string;
    image?: string;
    product_count?: number;
}

const dummyCategories: Category[] = [
    { id: "1", name: "Áo Thun", image: "/images/tshirt.jpg", product_count: 25 },
    { id: "2", name: "Quần Jean", image: "/images/jeans.jpg", product_count: 18 },
    { id: "3", name: "Áo Khoác", image: "/images/jacket.jpg", product_count: 12 },
    { id: "4", name: "Giày Dép", image: "/images/shoes.jpg", product_count: 30 },
];

const Home: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setCategories(dummyCategories);
    }, []);

    const handleCategoryClick = (id: string) => {
        navigate(`/category/${id}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroBanner banner={{ title: "Chào mừng đến Shop", image: "/images/banner.jpg" }} />
            <CategorySection categories={categories} onCategoryClick={handleCategoryClick} />
            <ProductGrid />
            <Footer />
        </div>
    );
};

export default Home;

import Header from "../components/Header/Header";
import HeroBanner from "../components/Hero/HeroBanner.tsx";
import Footer from "../components/Footer/Footer";
import React from "react";
import CategorySection from "../components/Category/CategoryGrid.tsx";
import ProductGrid from "../components/Product/ProductGrid.tsx";
import LoginPage from "../components/Login/Login.tsx";

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroBanner />
            <CategorySection />
            <ProductGrid />
            <Footer />

        </div>
    );
};
export default Home;
